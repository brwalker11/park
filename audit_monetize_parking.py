#!/usr/bin/env python3
"""
Website Audit Script for Redirect and Canonical URL Issues
Audits monetize-parking.com for SEO technical issues
"""

import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse, urlunparse
from collections import defaultdict
import time
import json
from datetime import datetime
from typing import Set, Dict, List, Tuple, Optional

class WebsiteAuditor:
    def __init__(self, base_domains: List[str], max_pages: int = 100):
        self.base_domains = base_domains
        self.max_pages = max_pages
        self.crawled_urls: Set[str] = set()
        self.to_crawl: Set[str] = set()
        self.redirect_chains: Dict[str, List[Dict]] = {}
        self.canonical_issues: List[Dict] = []
        self.internal_link_issues: List[Dict] = []
        self.page_data: Dict[str, Dict] = {}
        self.sitemap_issues: List[str] = []
        self.preferred_format = None
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        })
        # Disable SSL verification warnings
        import urllib3
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

    def normalize_url(self, url: str) -> str:
        """Normalize URL by removing fragments and trailing slashes (except root)"""
        parsed = urlparse(url)
        # Remove fragment
        normalized = urlunparse((
            parsed.scheme,
            parsed.hostname or parsed.netloc,
            parsed.path,
            parsed.params,
            parsed.query,
            ''  # Remove fragment
        ))
        # Remove trailing slash unless it's the root
        if normalized.endswith('/') and len(urlparse(normalized).path) > 1:
            normalized = normalized.rstrip('/')
        elif not normalized.endswith('/') and len(urlparse(normalized).path) <= 1:
            normalized += '/'
        return normalized

    def is_internal_url(self, url: str) -> bool:
        """Check if URL is internal to our domains"""
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        return any(d in domain for d in ['monetize-parking.com'])

    def test_url_patterns(self, path: str = '') -> Dict[str, Dict]:
        """Test all 4 URL patterns (http/https, www/non-www) for a given path"""
        patterns = {
            'http_nowww': f'http://monetize-parking.com{path}',
            'http_www': f'http://www.monetize-parking.com{path}',
            'https_nowww': f'https://monetize-parking.com{path}',
            'https_www': f'https://www.monetize-parking.com{path}',
        }

        results = {}
        for pattern_name, url in patterns.items():
            try:
                print(f"  Testing {pattern_name}: {url}")
                response = self.session.get(url, allow_redirects=False, timeout=10, verify=False)

                redirect_chain = []
                current_url = url
                redirect_count = 0

                while response.status_code in [301, 302, 303, 307, 308] and redirect_count < 10:
                    redirect_count += 1
                    next_url = response.headers.get('Location', '')
                    if not next_url.startswith('http'):
                        next_url = urljoin(current_url, next_url)

                    redirect_chain.append({
                        'from': current_url,
                        'to': next_url,
                        'status': response.status_code
                    })

                    current_url = next_url
                    time.sleep(0.5)  # Be polite
                    response = self.session.get(current_url, allow_redirects=False, timeout=10, verify=False)

                results[pattern_name] = {
                    'initial_url': url,
                    'final_url': current_url,
                    'final_status': response.status_code,
                    'redirect_chain': redirect_chain,
                    'redirect_hops': len(redirect_chain)
                }

                time.sleep(1)  # Rate limiting

            except Exception as e:
                results[pattern_name] = {
                    'initial_url': url,
                    'error': str(e)
                }

        return results

    def fetch_page(self, url: str) -> Optional[Tuple[int, str, requests.Response]]:
        """Fetch a page and return status code, final URL, and response"""
        try:
            response = self.session.get(url, allow_redirects=True, timeout=10, verify=False)
            return response.status_code, response.url, response
        except Exception as e:
            print(f"Error fetching {url}: {e}")
            return None

    def extract_canonical(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract canonical URL from page"""
        canonical = soup.find('link', rel='canonical')
        if canonical and canonical.get('href'):
            return canonical.get('href')
        return None

    def extract_internal_links(self, soup: BeautifulSoup, base_url: str) -> List[str]:
        """Extract all internal links from page"""
        links = []
        for anchor in soup.find_all('a', href=True):
            href = anchor['href']
            full_url = urljoin(base_url, href)
            if self.is_internal_url(full_url):
                links.append(full_url)
        return links

    def crawl_page(self, url: str):
        """Crawl a single page and extract information"""
        if url in self.crawled_urls or len(self.crawled_urls) >= self.max_pages:
            return

        print(f"Crawling [{len(self.crawled_urls) + 1}/{self.max_pages}]: {url}")

        result = self.fetch_page(url)
        if not result:
            return

        status_code, final_url, response = result
        self.crawled_urls.add(url)

        # Parse HTML
        soup = BeautifulSoup(response.content, 'html.parser')

        # Extract canonical
        canonical = self.extract_canonical(soup)

        # Extract internal links
        internal_links = self.extract_internal_links(soup, final_url)

        # Detect preferred format from the first successfully crawled page
        if self.preferred_format is None and status_code == 200:
            parsed = urlparse(final_url)
            if parsed.scheme == 'https':
                if 'www.' in parsed.netloc:
                    self.preferred_format = 'https://www'
                else:
                    self.preferred_format = 'https://'

        # Store page data
        self.page_data[url] = {
            'final_url': final_url,
            'status_code': status_code,
            'canonical': canonical,
            'internal_links': internal_links,
            'title': soup.title.string if soup.title else None
        }

        # Check canonical tag
        if canonical:
            expected_format = self.preferred_format if self.preferred_format else 'https://www'
            if not canonical.startswith(expected_format):
                self.canonical_issues.append({
                    'page': url,
                    'canonical': canonical,
                    'issue': f'Canonical does not use preferred format ({expected_format})'
                })
        else:
            self.canonical_issues.append({
                'page': url,
                'canonical': None,
                'issue': 'Missing canonical tag'
            })

        # Check internal links for wrong format
        for link in internal_links:
            parsed = urlparse(link)
            if parsed.scheme == 'http':
                self.internal_link_issues.append({
                    'page': url,
                    'link': link,
                    'issue': 'Internal link uses HTTP instead of HTTPS'
                })
            elif self.preferred_format and not link.startswith(self.preferred_format):
                # Check if it's using wrong www format
                if (self.preferred_format == 'https://www' and 'https://monetize-parking.com' in link and 'www' not in link):
                    self.internal_link_issues.append({
                        'page': url,
                        'link': link,
                        'issue': 'Internal link missing www prefix'
                    })
                elif (self.preferred_format == 'https://' and 'https://www.monetize-parking.com' in link):
                    self.internal_link_issues.append({
                        'page': url,
                        'link': link,
                        'issue': 'Internal link has www prefix when it should not'
                    })

        # Add new URLs to crawl queue
        for link in internal_links:
            normalized = self.normalize_url(link)
            if normalized not in self.crawled_urls and normalized not in self.to_crawl:
                self.to_crawl.add(normalized)

        time.sleep(1.5)  # Rate limiting between requests

    def crawl(self):
        """Main crawling loop"""
        print("Starting crawl...\n")

        # Start with both www and non-www versions
        for domain in self.base_domains:
            self.to_crawl.add(domain)

        while self.to_crawl and len(self.crawled_urls) < self.max_pages:
            url = self.to_crawl.pop()
            self.crawl_page(url)

    def check_sitemap(self):
        """Check sitemap for consistency issues"""
        print("\nChecking sitemap...")

        sitemap_urls = [
            'https://monetize-parking.com/sitemap.xml',
            'https://www.monetize-parking.com/sitemap.xml'
        ]

        for sitemap_url in sitemap_urls:
            try:
                response = self.session.get(sitemap_url, timeout=10, verify=False)
                if response.status_code == 200:
                    print(f"Found sitemap at: {sitemap_url}")
                    soup = BeautifulSoup(response.content, 'xml')

                    # Extract all URLs from sitemap
                    urls = [loc.text for loc in soup.find_all('loc')]

                    print(f"Found {len(urls)} URLs in sitemap")

                    # Check for consistency
                    http_urls = [u for u in urls if u.startswith('http://')]
                    https_urls = [u for u in urls if u.startswith('https://')]
                    www_urls = [u for u in urls if '://www.' in u]
                    nowww_urls = [u for u in urls if '://' in u and '://www.' not in u]

                    if http_urls:
                        self.sitemap_issues.append(f"Sitemap contains {len(http_urls)} HTTP URLs (should be HTTPS)")

                    if www_urls and nowww_urls:
                        self.sitemap_issues.append(f"Sitemap has mixed www formats: {len(www_urls)} with www, {len(nowww_urls)} without")

                    # Store for report
                    self.sitemap_data = {
                        'url': sitemap_url,
                        'total_urls': len(urls),
                        'http_urls': len(http_urls),
                        'https_urls': len(https_urls),
                        'www_urls': len(www_urls),
                        'nowww_urls': len(nowww_urls),
                        'sample_urls': urls[:10]
                    }

                    break

            except Exception as e:
                print(f"Error checking {sitemap_url}: {e}")

    def test_redirect_patterns(self):
        """Test redirect patterns for homepage and sample pages"""
        print("\nTesting redirect patterns...")

        # Test homepage
        print("\nHomepage redirect patterns:")
        self.redirect_chains['homepage'] = self.test_url_patterns('/')

        # Get sample pages from crawled data
        sample_pages = []
        for url in list(self.page_data.keys())[:5]:
            parsed = urlparse(url)
            if parsed.path and parsed.path != '/':
                sample_pages.append(parsed.path)

        # Test sample pages
        for i, path in enumerate(sample_pages[:5], 1):
            print(f"\nSample page {i} redirect patterns ({path}):")
            self.redirect_chains[f'sample_{i}_{path}'] = self.test_url_patterns(path)

    def generate_report(self) -> str:
        """Generate markdown audit report"""
        report = []
        report.append("# Website Audit Report: monetize-parking.com")
        report.append(f"\n**Audit Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        report.append("---\n")

        # Executive Summary
        report.append("## Executive Summary\n")
        report.append(f"- **Pages Crawled:** {len(self.crawled_urls)}")
        report.append(f"- **Preferred Domain Format:** {self.preferred_format or 'Not detected'}")
        report.append(f"- **Canonical Issues Found:** {len(self.canonical_issues)}")
        report.append(f"- **Internal Link Issues Found:** {len(self.internal_link_issues)}")
        report.append(f"- **Sitemap Issues:** {len(self.sitemap_issues)}")
        report.append("")

        # Preferred Domain Format
        report.append("## 1. Preferred Domain Format\n")
        if self.preferred_format:
            report.append(f"**Detected Format:** `{self.preferred_format}monetize-parking.com/`\n")
            if self.preferred_format == 'https://www':
                report.append("✓ The site uses HTTPS with www prefix (recommended)")
            else:
                report.append("✓ The site uses HTTPS without www prefix")
        else:
            report.append("⚠️ Could not detect preferred format")
        report.append("")

        # Redirect Pattern Analysis
        report.append("## 2. Redirect Pattern Analysis\n")

        for page_name, patterns in self.redirect_chains.items():
            report.append(f"### {page_name}\n")

            # Check if all patterns redirect to same final URL
            final_urls = set()
            for pattern_name, data in patterns.items():
                if 'final_url' in data:
                    final_urls.add(data['final_url'])

            if len(final_urls) == 1:
                report.append(f"✓ All URL patterns redirect to: `{final_urls.pop()}`\n")
            else:
                report.append(f"⚠️ URL patterns redirect to different destinations!\n")

            report.append("| Pattern | Initial URL | Redirects | Final URL | Status |")
            report.append("|---------|-------------|-----------|-----------|--------|")

            for pattern_name, data in patterns.items():
                if 'error' in data:
                    report.append(f"| {pattern_name} | {data['initial_url']} | ERROR | - | {data['error']} |")
                else:
                    hops = data['redirect_hops']
                    status_icon = "✓" if hops <= 1 else "⚠️"
                    report.append(f"| {pattern_name} | {data['initial_url']} | {hops} {status_icon} | {data['final_url']} | {data['final_status']} |")

            # Show redirect chains if any
            has_chains = any(d.get('redirect_hops', 0) > 0 for d in patterns.values() if 'redirect_hops' in d)
            if has_chains:
                report.append("\n**Redirect Chains:**\n")
                for pattern_name, data in patterns.items():
                    if data.get('redirect_chain'):
                        report.append(f"\n*{pattern_name}:*")
                        for i, hop in enumerate(data['redirect_chain'], 1):
                            report.append(f"{i}. `{hop['from']}` → `{hop['to']}` ({hop['status']})")

            report.append("")

        # Canonical Tag Issues
        report.append("## 3. Canonical Tag Issues\n")
        if self.canonical_issues:
            report.append(f"Found **{len(self.canonical_issues)} pages** with canonical tag issues:\n")

            # Group by issue type
            missing_canonical = [i for i in self.canonical_issues if i['canonical'] is None]
            wrong_format = [i for i in self.canonical_issues if i['canonical'] is not None]

            if missing_canonical:
                report.append(f"### Missing Canonical Tags ({len(missing_canonical)} pages)\n")
                for issue in missing_canonical[:10]:  # Show first 10
                    report.append(f"- {issue['page']}")
                if len(missing_canonical) > 10:
                    report.append(f"\n*...and {len(missing_canonical) - 10} more*")
                report.append("")

            if wrong_format:
                report.append(f"### Incorrect Canonical Format ({len(wrong_format)} pages)\n")
                for issue in wrong_format[:10]:  # Show first 10
                    report.append(f"- **Page:** {issue['page']}")
                    report.append(f"  - **Canonical:** `{issue['canonical']}`")
                    report.append(f"  - **Issue:** {issue['issue']}")
                    report.append("")
                if len(wrong_format) > 10:
                    report.append(f"*...and {len(wrong_format) - 10} more*\n")
        else:
            report.append("✓ No canonical tag issues found!\n")

        # Internal Link Issues
        report.append("## 4. Internal Link Issues\n")
        if self.internal_link_issues:
            report.append(f"Found **{len(self.internal_link_issues)} internal links** with issues:\n")

            # Group by issue type
            http_links = [i for i in self.internal_link_issues if 'HTTP instead of HTTPS' in i['issue']]
            www_issues = [i for i in self.internal_link_issues if 'www' in i['issue'].lower()]

            if http_links:
                report.append(f"### HTTP Links ({len(http_links)} instances)\n")
                # Show unique pages with HTTP links
                pages_with_http = {}
                for issue in http_links:
                    page = issue['page']
                    if page not in pages_with_http:
                        pages_with_http[page] = []
                    pages_with_http[page].append(issue['link'])

                for page, links in list(pages_with_http.items())[:5]:
                    report.append(f"- **{page}**")
                    for link in links[:3]:
                        report.append(f"  - {link}")
                    if len(links) > 3:
                        report.append(f"  - *...and {len(links) - 3} more*")
                    report.append("")

                if len(pages_with_http) > 5:
                    report.append(f"*...and {len(pages_with_http) - 5} more pages*\n")

            if www_issues:
                report.append(f"### WWW Format Issues ({len(www_issues)} instances)\n")
                for issue in www_issues[:5]:
                    report.append(f"- **Page:** {issue['page']}")
                    report.append(f"  - **Link:** {issue['link']}")
                    report.append(f"  - **Issue:** {issue['issue']}")
                    report.append("")
                if len(www_issues) > 5:
                    report.append(f"*...and {len(www_issues) - 5} more*\n")
        else:
            report.append("✓ No internal link issues found!\n")

        # Sitemap Analysis
        report.append("## 5. Sitemap Analysis\n")
        if hasattr(self, 'sitemap_data'):
            data = self.sitemap_data
            report.append(f"**Sitemap URL:** {data['url']}\n")
            report.append(f"- Total URLs: {data['total_urls']}")
            report.append(f"- HTTP URLs: {data['http_urls']}")
            report.append(f"- HTTPS URLs: {data['https_urls']}")
            report.append(f"- URLs with www: {data['www_urls']}")
            report.append(f"- URLs without www: {data['nowww_urls']}")
            report.append("")

            if self.sitemap_issues:
                report.append("**Issues Found:**\n")
                for issue in self.sitemap_issues:
                    report.append(f"- ⚠️ {issue}")
                report.append("")
            else:
                report.append("✓ No sitemap issues found!\n")

            report.append("**Sample URLs from sitemap:**\n")
            for url in data['sample_urls']:
                report.append(f"- {url}")
            report.append("")
        else:
            report.append("⚠️ Could not fetch sitemap\n")

        # Recommendations
        report.append("## 6. Recommendations\n")

        recommendations = []

        # Check for redirect chain issues
        long_chains = []
        for page_name, patterns in self.redirect_chains.items():
            for pattern_name, data in patterns.items():
                if data.get('redirect_hops', 0) > 1:
                    long_chains.append((page_name, pattern_name, data['redirect_hops']))

        if long_chains:
            recommendations.append({
                'priority': 'HIGH',
                'issue': 'Redirect chains detected',
                'description': f'Found {len(long_chains)} URL patterns with multiple redirect hops',
                'action': 'Update server configuration to redirect directly to final URL in one hop (301 redirect)'
            })

        if self.canonical_issues:
            missing = len([i for i in self.canonical_issues if i['canonical'] is None])
            if missing > 0:
                recommendations.append({
                    'priority': 'HIGH',
                    'issue': 'Missing canonical tags',
                    'description': f'{missing} pages are missing canonical tags',
                    'action': 'Add <link rel="canonical" href="preferred-url"> to all pages'
                })

            wrong_format = len([i for i in self.canonical_issues if i['canonical'] is not None])
            if wrong_format > 0:
                recommendations.append({
                    'priority': 'MEDIUM',
                    'issue': 'Incorrect canonical URLs',
                    'description': f'{wrong_format} pages have canonical tags pointing to non-preferred URL format',
                    'action': f'Update canonical tags to use {self.preferred_format} format consistently'
                })

        if self.internal_link_issues:
            http_links = len([i for i in self.internal_link_issues if 'HTTP instead of HTTPS' in i['issue']])
            if http_links > 0:
                recommendations.append({
                    'priority': 'HIGH',
                    'issue': 'HTTP internal links',
                    'description': f'{http_links} internal links use HTTP instead of HTTPS',
                    'action': 'Update all internal links to use HTTPS protocol'
                })

            www_issues = len([i for i in self.internal_link_issues if 'www' in i['issue'].lower()])
            if www_issues > 0:
                recommendations.append({
                    'priority': 'MEDIUM',
                    'issue': 'Inconsistent www format in internal links',
                    'description': f'{www_issues} internal links use wrong www format',
                    'action': f'Update internal links to consistently use {self.preferred_format} format'
                })

        if self.sitemap_issues:
            for issue in self.sitemap_issues:
                if 'HTTP URLs' in issue:
                    recommendations.append({
                        'priority': 'HIGH',
                        'issue': 'Sitemap contains HTTP URLs',
                        'description': issue,
                        'action': 'Update sitemap to use HTTPS URLs only'
                    })
                if 'mixed www' in issue:
                    recommendations.append({
                        'priority': 'MEDIUM',
                        'issue': 'Mixed www formats in sitemap',
                        'description': issue,
                        'action': 'Use consistent www format in sitemap'
                    })

        if not recommendations:
            report.append("✓ **No major issues found!** The site appears to be properly configured.\n")
        else:
            # Sort by priority
            priority_order = {'HIGH': 0, 'MEDIUM': 1, 'LOW': 2}
            recommendations.sort(key=lambda x: priority_order.get(x['priority'], 3))

            for i, rec in enumerate(recommendations, 1):
                report.append(f"### {i}. {rec['issue']} [{rec['priority']} Priority]\n")
                report.append(f"**Description:** {rec['description']}\n")
                report.append(f"**Action Required:** {rec['action']}\n")

        # Crawled Pages Summary
        report.append("## 7. Crawled Pages Summary\n")
        report.append(f"Total pages crawled: {len(self.crawled_urls)}\n")
        report.append("**Sample of crawled pages:**\n")
        for url in list(self.crawled_urls)[:20]:
            data = self.page_data.get(url, {})
            status = data.get('status_code', 'Unknown')
            title = data.get('title', 'No title')
            report.append(f"- [{status}] {url}")
            report.append(f"  - Title: {title}")

        if len(self.crawled_urls) > 20:
            report.append(f"\n*...and {len(self.crawled_urls) - 20} more pages*")

        report.append("\n---\n")
        report.append("*End of Report*")

        return '\n'.join(report)


def main():
    print("=" * 60)
    print("Website Audit: monetize-parking.com")
    print("Checking redirects, canonicals, and internal links")
    print("=" * 60)
    print()

    # Initialize auditor with both www and non-www
    auditor = WebsiteAuditor(
        base_domains=[
            'https://monetize-parking.com/',
            'https://www.monetize-parking.com/'
        ],
        max_pages=100
    )

    # Run crawl
    auditor.crawl()

    # Check sitemap
    auditor.check_sitemap()

    # Test redirect patterns
    auditor.test_redirect_patterns()

    # Generate report
    print("\nGenerating report...")
    report = auditor.generate_report()

    # Save report
    filename = f'monetize_parking_audit_{datetime.now().strftime("%Y%m%d_%H%M%S")}.md'
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(report)

    print(f"\n✓ Report saved to: {filename}")
    print("\nAudit complete!")


if __name__ == '__main__':
    main()
