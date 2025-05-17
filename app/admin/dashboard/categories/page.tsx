'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  getCategories, 
  getBrands, 
  createCategory, 
  createBrand,
  updateCategory,
  updateBrand,
  deleteCategory,
  deleteBrand,
  type Category, 
  type Brand 
} from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Plus, 
  Trash, 
  Save, 
  X, 
  Pencil, 
  MoreHorizontal, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Add temporary replacements for missing components
const Badge = ({ children, variant, className }: { children: React.ReactNode, variant?: string, className?: string }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground ${className}`}>
    {children}
  </span>
);

export default function CategoriesPage() {
  // State
  const [activeTab, setActiveTab] = useState('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [editingBrand, setEditingBrand] = useState<string | null>(null);
  const [editingBrandName, setEditingBrandName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: 'category' | 'brand';
    id: string;
    name: string;
  }>({
    open: false,
    type: 'category',
    id: '',
    name: '',
  });

  // For focusing input on edit
  const editCategoryInputRef = useRef<HTMLInputElement>(null);
  const editBrandInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingCategory && editCategoryInputRef.current) {
      editCategoryInputRef.current.focus();
    }
  }, [editingCategory]);
  useEffect(() => {
    if (editingBrand && editBrandInputRef.current) {
      editBrandInputRef.current.focus();
    }
  }, [editingBrand]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [categoriesData, brandsData] = await Promise.all([
          getCategories(),
          getBrands(),
        ]);
        setCategories(categoriesData);
        setBrands(brandsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handlers
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    setIsSubmitting(true);
    try {
      const newCategory = await createCategory(newCategoryName);
      if (newCategory) {
        setCategories([...categories, newCategory]);
        setNewCategoryName('');
      }
    } catch (error) {
      console.error('Error adding category:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    
    setIsSubmitting(true);
    try {
      const newBrand = await createBrand(newBrandName);
      if (newBrand) {
        setBrands([...brands, newBrand]);
        setNewBrandName('');
      }
    } catch (error) {
      console.error('Error adding brand:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditCategory = (category: Category) => {
    setEditingCategory(category.id);
    setEditingCategoryName(category.name);
  };

  const cancelEditCategory = () => {
    setEditingCategory(null);
    setEditingCategoryName('');
  };

  const saveEditCategory = async (id: string) => {
    if (!editingCategoryName.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      const updatedCategory = await updateCategory(id, editingCategoryName);
      if (updatedCategory) {
        setCategories(categories.map(cat => 
          cat.id === id ? updatedCategory : cat
        ));
      }
      setEditingCategory(null);
      setEditingCategoryName('');
    } catch (error) {
      console.error('Error updating category:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditBrand = (brand: Brand) => {
    setEditingBrand(brand.id);
    setEditingBrandName(brand.name);
  };

  const cancelEditBrand = () => {
    setEditingBrand(null);
    setEditingBrandName('');
  };

  const saveEditBrand = async (id: string) => {
    if (!editingBrandName.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      const updatedBrand = await updateBrand(id, editingBrandName);
      if (updatedBrand) {
        setBrands(brands.map(brand => 
          brand.id === id ? updatedBrand : brand
        ));
      }
      setEditingBrand(null);
      setEditingBrandName('');
    } catch (error) {
      console.error('Error updating brand:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteDialog = (type: 'category' | 'brand', id: string, name: string) => {
    setDeleteDialog({
      open: true,
      type,
      id,
      name,
    });
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      if (deleteDialog.type === 'category') {
        const success = await deleteCategory(deleteDialog.id);
        if (success) {
          setCategories(categories.filter(cat => cat.id !== deleteDialog.id));
        }
      } else {
        const success = await deleteBrand(deleteDialog.id);
        if (success) {
          setBrands(brands.filter(brand => brand.id !== deleteDialog.id));
        }
      }
    } catch (error) {
      console.error(`Error deleting ${deleteDialog.type}:`, error);
    } finally {
      setDeleteDialog({ ...deleteDialog, open: false });
      setIsSubmitting(false);
    }
  };

  // Responsive table: stack on mobile
  const tableWrapperClass = "rounded-md overflow-x-auto text-right p-4";
  const tableClass = "min-w-full";
  const tableCellClass = "py-4 font-medium break-words max-w-xs";

  return (
    <div className="space-y-8  pb-12 px-2 sm:px-0">
      <div className="space-y-0.5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">ניהול קטגוריות ומותגים</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          נהל את קטגוריות המוצרים והמותגים בחנות שלך
        </p>
      </div>
      
      <hr className="my-6 border-t border-muted" />
      
      <Tabs defaultValue="categories" onValueChange={setActiveTab} value={activeTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="categories" className="text-base">קטגוריות</TabsTrigger>
          <TabsTrigger value="brands" className="text-base">מותגים</TabsTrigger>
        </TabsList>
        
        <TabsContent value="categories" className="space-y-6 mt-6 animate-in fade-in-50 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0">
          {/* Add Category Form */}
          <Card className="shadow-sm border-muted">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl font-bold">הוספת קטגוריה חדשה</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                קטגוריות עוזרות לארגן מוצרים בחנות שלך ולהקל על הלקוחות למצוא את מה שהם מחפשים
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end">
                <div className="flex-1">
                  <Label htmlFor="new-category" className="text-sm font-medium">שם הקטגוריה</Label>
                  <Input
                    id="new-category"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="הזן שם קטגוריה..."
                    className="mt-1.5"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="flex gap-2 items-center w-full sm:w-auto mt-2 sm:mt-0"
                  disabled={isSubmitting || !newCategoryName.trim()}
                  size="lg"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  הוסף קטגוריה
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Categories Stats */}
          <div className="mb-6">
            <Badge variant="outline" className="px-3 py-1 text-sm">
              סה״כ קטגוריות: {categories.length}
            </Badge>
          </div>
          
          {/* Categories Table */}
          <Card className="shadow-sm border-muted">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl font-bold">קטגוריות</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                רשימת כל הקטגוריות הזמינות בחנות שלך
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>טוען קטגוריות...</span>
                </div>
              ) : categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-muted/30 rounded-md m-6">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-xl font-medium">אין קטגוריות להצגה</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    השתמש בטופס למעלה כדי להוסיף את הקטגוריה הראשונה שלך
                  </p>
                </div>
              ) : (
                <div className={tableWrapperClass}>
                  <Table className={tableClass}>
                    <TableHeader>
                      <TableRow className="hover:bg-muted bg-muted/50">
                        <TableHead className="font-medium">שם הקטגוריה</TableHead>
                        <TableHead className="w-[100px] text-right">פעולות</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category) => (
                        <TableRow key={category.id} className="transition-colors">
                          <TableCell className={tableCellClass}>
                            {editingCategory === category.id ? (
                              <div className="flex flex-col sm:flex-row gap-2 w-full">
                                <Input
                                  ref={editCategoryInputRef}
                                  value={editingCategoryName}
                                  onChange={(e) => setEditingCategoryName(e.target.value)}
                                  className="max-w-xs w-full"
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      saveEditCategory(category.id);
                                    }
                                    if (e.key === 'Escape') {
                                      cancelEditCategory();
                                    }
                                  }}
                                />
                                <div className="flex gap-2 mt-2 sm:mt-0">
                                  <Button 
                                    size="icon" 
                                    variant="outline" 
                                    onClick={() => saveEditCategory(category.id)}
                                    disabled={isSubmitting}
                                    aria-label="שמור"
                                  >
                                    {isSubmitting ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Save className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="outline" 
                                    onClick={cancelEditCategory}
                                    disabled={isSubmitting}
                                    aria-label="ביטול"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-2">
                                <span className="truncate">{category.name}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="sm:hidden"
                                  aria-label="ערוך"
                                  onClick={() => startEditCategory(category)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {editingCategory !== category.id && (
                              <div className="flex justify-end">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem 
                                      onClick={() => startEditCategory(category)}
                                      className="flex items-center gap-2 cursor-pointer"
                                    >
                                      <Pencil className="h-4 w-4" /> ערוך
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => openDeleteDialog('category', category.id, category.name)}
                                      className="flex items-center gap-2 text-destructive cursor-pointer"
                                    >
                                      <Trash className="h-4 w-4" /> מחק
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                                {/* On mobile, show delete as icon */}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="sm:hidden ml-2"
                                  aria-label="מחק"
                                  onClick={() => openDeleteDialog('category', category.id, category.name)}
                                >
                                  <Trash className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="brands" className="space-y-6 mt-6 animate-in fade-in-50 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0">
          {/* Add Brand Form */}
          <Card className="shadow-sm border-muted">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl font-bold">הוספת מותג חדש</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                ניהול מותגים בחנות מאפשר ללקוחות לסנן ולחפש מוצרים לפי מותג מועדף
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddBrand} className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end">
                <div className="flex-1">
                  <Label htmlFor="new-brand" className="text-sm font-medium">שם המותג</Label>
                  <Input
                    id="new-brand"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    placeholder="הזן שם מותג..."
                    className="mt-1.5"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="flex gap-2 items-center w-full sm:w-auto mt-2 sm:mt-0"
                  disabled={isSubmitting || !newBrandName.trim()}
                  size="lg"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  הוסף מותג
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Brands Stats */}
          <div className="mb-6">
            <Badge variant="outline" className="px-3 py-1 text-sm">
              סה״כ מותגים: {brands.length}
            </Badge>
          </div>
          
          {/* Brands Table */}
          <Card className="shadow-sm border-muted">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl font-bold">מותגים</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                רשימת כל המותגים הזמינים בחנות שלך
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>טוען מותגים...</span>
                </div>
              ) : brands.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-muted/30 rounded-md m-6">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-xl font-medium">אין מותגים להצגה</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    השתמש בטופס למעלה כדי להוסיף את המותג הראשון שלך
                  </p>
                </div>
              ) : (
                <div className={tableWrapperClass}>
                  <Table className={tableClass}>
                    <TableHeader>
                      <TableRow className="hover:bg-muted bg-muted/50">
                        <TableHead className="font-medium">שם המותג</TableHead>
                        <TableHead className="w-[100px] text-right">פעולות</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {brands.map((brand) => (
                        <TableRow key={brand.id} className="transition-colors">
                          <TableCell className={tableCellClass}>
                            {editingBrand === brand.id ? (
                              <div className="flex flex-col sm:flex-row gap-2 w-full">
                                <Input
                                  ref={editBrandInputRef}
                                  value={editingBrandName}
                                  onChange={(e) => setEditingBrandName(e.target.value)}
                                  className="max-w-xs w-full"
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      saveEditBrand(brand.id);
                                    }
                                    if (e.key === 'Escape') {
                                      cancelEditBrand();
                                    }
                                  }}
                                />
                                <div className="flex gap-2 mt-2 sm:mt-0">
                                  <Button 
                                    size="icon" 
                                    variant="outline" 
                                    onClick={() => saveEditBrand(brand.id)}
                                    disabled={isSubmitting}
                                    aria-label="שמור"
                                  >
                                    {isSubmitting ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Save className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="outline" 
                                    onClick={cancelEditBrand}
                                    disabled={isSubmitting}
                                    aria-label="ביטול"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-2">
                                <span className="truncate">{brand.name}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="sm:hidden"
                                  aria-label="ערוך"
                                  onClick={() => startEditBrand(brand)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {editingBrand !== brand.id && (
                              <div className="flex justify-end">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem 
                                      onClick={() => startEditBrand(brand)}
                                      className="flex items-center gap-2 cursor-pointer"
                                    >
                                      <Pencil className="h-4 w-4" /> ערוך
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => openDeleteDialog('brand', brand.id, brand.name)}
                                      className="flex items-center gap-2 text-destructive cursor-pointer"
                                    >
                                      <Trash className="h-4 w-4" /> מחק
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                                {/* On mobile, show delete as icon */}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="sm:hidden ml-2"
                                  aria-label="מחק"
                                  onClick={() => openDeleteDialog('brand', brand.id, brand.name)}
                                >
                                  <Trash className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">האם אתה בטוח?</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              האם אתה בטוח שברצונך למחוק את {deleteDialog.type === 'category' ? 'הקטגוריה' : 'המותג'} &quot;{deleteDialog.name}&quot;?
              {deleteDialog.type === 'category' && (
                <div className="flex items-center mt-4 p-3 text-destructive border border-destructive/30 bg-destructive/10 rounded-md">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span className="text-sm font-medium">
                    שים לב: מחיקת קטגוריה תשפיע על כל המוצרים המשויכים אליה.
                  </span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={isSubmitting}>ביטול</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  מוחק...
                </>
              ) : (
                <>מחק</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 