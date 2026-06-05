export function Footer() {
  return (
    <footer className="border-t border-border-base py-6 px-6 text-center">
      <small className="text-sm text-text-muted">
        © {new Date().getFullYear()} 클린하우스. All rights reserved.
      </small>
    </footer>
  );
}
