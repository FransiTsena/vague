export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="platform-container bg-black">
      {/* Specifically omitted the Header here */}
      <main>{children}</main>
    </div>
  );
}
