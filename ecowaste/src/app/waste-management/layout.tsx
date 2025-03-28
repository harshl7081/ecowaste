import { ClerkProvider } from "@clerk/nextjs";

export default function WasteManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  );
} 