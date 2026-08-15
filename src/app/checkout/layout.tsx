export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style>{`
        body {
          background-color: #060609 !important;
          --bg: #060609;
        }
        main {
          background-color: transparent;
        }
      `}</style>
      {children}
    </>
  );
}
