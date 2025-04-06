import NavBar from "@/app/components/molecules/NavBar";

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const navItems = [
        "/home",
        "/meu-perfil",
        "/history"
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="fixed top-0 left-0 right-0 z-50">
                <NavBar itens={navItems} />
            </div>
            <main className="container mx-auto px-4 py-8 pt-24">
                {children}
            </main>
        </div>
    );
}
