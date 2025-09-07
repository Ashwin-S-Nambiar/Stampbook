export default function Footer() {
    const currentYear = new Date().getFullYear()
    
    return (
        <footer>
            <div className="footer-content">
                <p>&copy; 2024 - {currentYear} Ashwin, All rights reserved.</p>
                <div className="social-links">
                    <a href="https://x.com/ashwinnambiar11" aria-label="Twitter">
                        <i className="fab fa-twitter"></i>
                    </a>
                    <a href="https://www.linkedin.com/in/ashwin-s-nambiar-0b7a5b202/" aria-label="LinkedIn">
                        <i className="fab fa-linkedin"></i>
                    </a>
                    <a href="https://github.com/Ashwin-S-Nambiar" aria-label="GitHub">
                        <i className="fab fa-github"></i>
                    </a>
                </div>
            </div>
        </footer>
    )
}