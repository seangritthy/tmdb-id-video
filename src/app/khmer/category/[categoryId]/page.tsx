import CategoryGrid from "@/components/sections/KhmerDubbed/CategoryGrid";
import { Battambang } from "@/utils/fonts";
import { cn } from "@/utils/helpers";

interface PageProps {
  params: Promise<{ categoryId: string }>;
}

export default async function KhmerCategoryPage({ params }: PageProps) {
  const { categoryId } = await params;
  
  const categories: Record<string, string> = {
    "tvshows": "រឿងភាគនិយាយខ្មែរ",
    "chinese-drama": "រឿងភាគចិននិយាយខ្មែរ",
    "korean-drama": "រឿងភាគកូរ៉េនិយាយខ្មែរ",
    "movies": "ភាពយន្តនិយាយខ្មែរ"
  };

  const title = categories[categoryId] || "Khmer Dubbed";

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-12">
        <h1 className={cn("text-3xl font-bold text-white", Battambang.className)}>{title}</h1>
      </div>
      <CategoryGrid categoryId={categoryId} />
    </main>
  );
}
