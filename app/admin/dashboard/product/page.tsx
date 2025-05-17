'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
import { Plus, MoreVertical, Pencil, Trash, Search } from 'lucide-react';

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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">ניהול מוצרים</h1>
        <Button asChild>
          <Link href="/admin/dashboard/product/new">
            <Plus className="ml-2 h-4 w-4" /> הוסף מוצר
          </Link>
        </Button>
      </div>

      <div className="flex items-center border rounded-md px-3 py-2 max-w-sm">
        <Search className="ml-2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="חיפוש מוצרים..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-0 p-0 shadow-none focus-visible:ring-0"
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
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
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
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>₪{product.price.toLocaleString()}</TableCell>
                  <TableCell>{product.category?.name || '-'}</TableCell>
                  <TableCell>{product.brand?.name || '-'}</TableCell>
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