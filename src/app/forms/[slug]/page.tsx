
import LiveFormPage from "@/components/LiveFormPage";
interface PageProps {
  params: {
    slug: string;
  };
}

// NOTE: Components inside the App Router are Server Components by default 
// and resolve params correctly before rendering client components.
export default function LiveFormPageWrapper({ params }: PageProps) {
  // Use a temporary variable for clarity
  const formSlug = params.slug;
  
  // The LiveFormPage is a client component, rendered here.
  // It receives the resolved slug from the server component's params.
  return <LiveFormPage slug={formSlug} />; 
}
