import React from 'react'
import Link from 'next/link'
import styles from '@styles/Navbar.module.css'

const Navbar: React.FC = () => {
  return (
    <nav className={styles.navbar}>
      <ul className={styles.navList}>
        <li className={styles.navItem}>
          <Link href="/services">
            <a className={styles.navLink}>Services</a>
          </Link>
          <ul className={styles.subNavList}>
            <li className={styles.subNavItem}>
              <Link href="/services/web-development">
                <a className={styles.subNavLink}>Web Development</a>
              </Link>
            </li>
            <li className={styles.subNavItem}>
              <Link href="/services/seo">
                <a className={styles.subNavLink}>SEO</a>
              </Link>
            </li>
            <li className={styles.subNavItem}>
              <Link href="/services/cloud-solutions">
                <a className={styles.subNavLink}>Cloud Solutions</a>
              </Link>
            </li>
            <li className={styles.subNavItem}>
              <Link href="/services/cyber-security">
                <a className={styles.subNavLink}>Cyber Security</a>
              </Link>
            </li>
          </ul>
        </li>
        <li className={styles.navItem}>
          <Link href="/solutions">
            <a className={styles.navLink}>Solutions</a>
          </Link>
          <ul className={styles.subNavList}>
            <li className={styles.subNavItem}>
              <Link href="/solutions/enterprise">
                <a className={styles.subNavLink}>Enterprise Solutions</a>
              </Link>
            </li>
            <li className={styles.subNavItem}>
              <Link href="/solutions/smb">
                <a className={styles.subNavLink}>SMB Solutions</a>
              </Link>
            </li>
          </ul>
        </li>
        <li className={styles.navItem}>
          <Link href="/capabilities">
            <a className={styles.navLink}>Capabilities</a>
          </Link>
          <ul className={styles.subNavList}>
            <li className={styles.subNavItem}>
              <Link href="/capabilities/consulting">
                <a className={styles.subNavLink}>Consulting</a>
              </Link>
            </li>
            <li className={styles.subNavItem}>
              <Link href="/capabilities/implementation">
                <a className={styles.subNavLink}>Implementation</a>
              </Link>
            </li>
          </ul>
        </li>
        <li className={styles.navItem}>
          <Link href="/company">
            <a className={styles.navLink}>Company</a>
          </Link>
          <ul className={styles.subNavList}>
            <li className={styles.subNavItem}>
              <Link href="/company/about">
                <a className={styles.subNavLink}>About Us</a>
              </Link>
            </li>
            <li className={styles.subNavItem}>
              <Link href="/company/team">
                <a className={styles.subNavLink}>Our Team</a>
              </Link>
            </li>
            <li className={styles.subNavItem}>
              <Link href="/company/careers">
                <a className={styles.subNavLink}>Careers</a>
              </Link>
            </li>
          </ul>
        </li>
        <li className={styles.navItem}>
          <Link href="/resources">
            <a className={styles.navLink}>Resources</a>
          </Link>
          <ul className={styles.subNavList}>
            <li className={styles.subNavItem}>
              <Link href="/resources/blog">
                <a className={styles.subNavLink}>Blog</a>
              </Link>
            </li>
            <li className={styles.subNavItem}>
              <Link href="/resources/case-studies">
                <a className={styles.subNavLink}>Case Studies</a>
              </Link>
            </li>
            <li className={styles.subNavItem}>
              <Link href="/resources/whitepapers">
                <a className={styles.subNavLink}>Whitepapers</a>
              </Link>
            </li>
          </ul>
        </li>
        <li className={styles.navItem}>
          <Link href="/industries">
            <a className={styles.navLink}>Industries</a>
          </Link>
          <ul className={styles.subNavList}>
            <li className={styles.subNavItem}>
              <Link href="/industries/healthcare">
                <a className={styles.subNavLink}>Healthcare</a>
              </Link>
            </li>
            <li className={styles.subNavItem}>
              <Link href="/industries/finance">
                <a className={styles.subNavLink}>Finance</a>
              </Link>
            </li>
            <li className={styles.subNavItem}>
              <Link href="/industries/education">
                <a className={styles.subNavLink}>Education</a>
              </Link>
            </li>
            <li className={styles.subNavItem}>
              <Link href="/industries/retail">
                <a className={styles.subNavLink}>Retail</a>
              </Link>
            </li>
            <li className={styles.subNavItem}>
              <Link href="/industries/manufacturing">
                <a className={styles.subNavLink}>Manufacturing</a>
              </Link>
            </li>
          </ul>
        </li>
        <li className={styles.navItem}>
          <Link href="/partners">
            <a className={styles.navLink}>Partners</a>
          </Link>
          <ul className={styles.subNavList}>
            <li className={styles.subNavItem}>
              <Link href="/partners/technology">
                <a className={styles.subNavLink}>Technology Partners</a>
              </Link>
            </li>
            <li className={styles.subNavItem}>
              <Link href="/partners/strategic">
                <a className={styles.subNavLink}>Strategic Alliances</a>
              </Link>
            </li>
            <li className={styles.subNavItem}>
              <Link href="/partners/become">
                <a className={styles.subNavLink}>Become a Partner</a>
              </Link>
            </li>
          </ul>
        </li>
        <li className={styles.navItem}>
          <Link href="/support">
            <a className={styles.navLink}>Support</a>
          </Link>
          <ul className={styles.subNavList}>
            <li className={styles.subNavItem}>
              <Link href="/support/help-center">
                <a className={styles.subNavLink}>Help Center</a>
              </Link>
            </li>
            <li className={styles.subNavItem}>
              <Link href="/support/documentation">
                <a className={styles.subNavLink}>Documentation</a>
              </Link>
            </li>
            <li className={styles.subNavItem}>
              <Link href="/support/community">
                <a className={styles.subNavLink}>Community Forum</a>
              </Link>
            </li>
            <li className={styles.subNavItem}>
              <Link href="/support/contact">
                <a className={styles.subNavLink}>Contact Support</a>
              </Link>
            </li>
          </ul>
        </li>
        <li className={styles.navItem}>
          <Link href="/events">
            <a className={styles.navLink}>Events</a>
          </Link>
          <ul className={styles.subNavList}>
            <li className={styles.subNavItem}>
              <Link href="/events/webinars">
                <a className={styles.subNavLink}>Webinars</a>
              </Link>
            </li>
            <li className={styles.subNavItem}>
              <Link href="/events/conferences">
                <a className={styles.subNavLink}>Conferences</a>
              </Link>
            </li>
            <li className={styles.subNavItem}>
              <Link href="/events/workshops">
                <a className={styles.subNavLink}>Workshops</a>
              </Link>
            </li>
          </ul>
        </li>
        <li className={styles.navItem}>
          <Link href="/news">
            <a className={styles.navLink}>News</a>
          </Link>
          <ul className={styles.subNavList}>
            <li className={styles.subNavItem}>
              <Link href="/news/press-releases">
                <a className={styles.subNavLink}>Press Releases</a>
              </Link>
            </li>
            <li className={styles.subNavItem}>
              <Link href="/news/in-the-news">
                <a className={styles.subNavLink}>In the News</a>
              </Link>
            </li>
            <li className={styles.subNavItem}>
              <Link href="/news/blog">
                <a className={styles.subNavLink}>Blog</a>
              </Link>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar
