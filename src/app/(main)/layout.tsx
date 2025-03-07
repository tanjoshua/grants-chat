import { Nav } from "@/components/nav";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Nav />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </>
  );
}
