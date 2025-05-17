'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  getProducts, 
  deleteProduct, 
  type Product 
} from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Plus, MoreVertical, Pencil, Trash, Search, Image as ImageIcon } from 'lucide-react';

// Responsive Card for mobile
function ProductCard({
  product,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="border rounded-lg p-4 mb-3 bg-card shadow-sm flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-16 h-16 rounded-md bg-muted flex items-center justify-center overflow-hidden border">
          {product.image_urls && product.image_urls[0] ? (
            <Image
              src={product.image_urls[0]}
              alt={product.name}
              width={64}
              height={64}
              className="object-contain w-full h-full"
            />
          ) : (
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <div className="font-bold text-base">{product.name}</div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />  
              <span className="sr-only">תפריט</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/dashboard/product/${product.id}`}>
                <Pencil className="ml-2 h-4 w-4" /> ערוך
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={onDelete}
            >
              <Trash className="ml-2 h-4 w-4" /> מחק
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex flex-col gap-2 mt-2 text-sm text-muted-foreground">
        <div>
          <span className="font-medium text-foreground">מחיר:</span>
          <br />
          ₪{product.price.toLocaleString()}
        </div>
        <div>
          <span className="font-medium text-foreground">קטגוריה:</span>
          <br />
          {product.category?.name || '-'}
        </div>
        <div>
          <span className="font-medium text-foreground">מותג:</span>
          <br />
          {product.brand?.name || '-'}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      const success = await deleteProduct(deleteId);
      if (success) {
        setProducts(products.filter(product => product.id !== deleteId));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setShowDeleteDialog(false);
      setDeleteId(null);
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">ניהול מוצרים</h1>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/dashboard/product/new">
            <Plus className="ml-2 h-4 w-4" /> הוסף מוצר
          </Link>
        </Button>
      </div>

      <div className="flex items-center border rounded-md px-3 py-2 max-w-full sm:max-w-sm">
        <Search className="ml-2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="חיפוש מוצרים..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-0 p-0 shadow-none focus-visible:ring-0 bg-transparent"
        />
      </div>

      {loading ? (
        <div className="text-center">טוען מוצרים...</div>
      ) : products.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-muted/40">
          <h3 className="text-lg font-medium mb-2">אין מוצרים</h3>
          <p className="text-muted-foreground mb-4">הוסף את המוצר הראשון שלך כעת</p>
          <Button asChild>
            <Link href="/admin/dashboard/product/new">
              <Plus className="ml-2 h-4 w-4" /> הוסף מוצר
            </Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden sm:block border rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>תמונה</TableHead>
                  <TableHead>שם המוצר</TableHead>
                  <TableHead>מחיר</TableHead>
                  <TableHead>קטגוריה</TableHead>
                  <TableHead>מותג</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center overflow-hidden border">
                        {product.image_urls && product.image_urls[0] ? (
                          <Image
                            src={product.image_urls[0]}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="object-contain w-full h-full"
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      ₪{product.price.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {product.category?.name || '-'}
                    </TableCell>
                    <TableCell>
                      {product.brand?.name || '-'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">תפריט</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/dashboard/product/${product.id}`}>
                              <Pencil className="ml-2 h-4 w-4" /> ערוך
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => confirmDelete(product.id)}
                          >
                            <Trash className="ml-2 h-4 w-4" /> מחק
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Mobile Cards */}
          <div className="block sm:hidden">
            {filteredProducts.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">לא נמצאו מוצרים</div>
            ) : (
              filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={() => window.location.href = `/admin/dashboard/product/${product.id}`}
                  onDelete={() => confirmDelete(product.id)}
                />
              ))
            )}
          </div>
        </>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תמחק את המוצר לצמיתות ולא ניתן יהיה לשחזר אותו.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDelete}
            >
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 