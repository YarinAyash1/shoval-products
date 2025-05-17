'use client';

export const runtime = 'edge';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getProductById, 
  updateProduct, 
  deleteProduct,
  uploadProductImage,
  getCategories,
  getBrands,
  createVariable,
  deleteVariable,
  createProduct,
  type Product,
  type Category,
  type Brand,
  type Variable
} from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRight, Trash } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Import our custom components
import {
  ProductDetails,
  ProductImageUploader,
  ProductVariables,
  DeleteProductDialog
} from './components';

type PageParams = {
  params: Promise<{ id: string }>;
};

export default function ProductFormPage({ params }: PageParams) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const productId = unwrappedParams.id;
  const isNewProduct = productId === 'new';
  
  // Form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('none');
  const [brandId, setBrandId] = useState('none');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [newVariableName, setNewVariableName] = useState('');
  const [newVariableValue, setNewVariableValue] = useState('');
  
  // Dropdown options
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch categories and brands for both new and edit
        const [categoriesData, brandsData] = await Promise.all([
          getCategories(),
          getBrands(),
        ]);
        
        setCategories(categoriesData);
        setBrands(brandsData);
        
        // If editing an existing product, fetch product data
        if (!isNewProduct) {
          const product = await getProductById(productId);
          
          if (!product) {
            setError('מוצר לא נמצא');
            return;
          }
          
          // Set form data
          setName(product.name);
          setPrice(product.price.toString());
          setDescription(product.description || '');
          setCategoryId(product.category_id || 'none');
          setBrandId(product.brand_id || 'none');
          setImageUrls(product.image_urls || []);
          setVariables(product.variables || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('אירעה שגיאה בטעינת הנתונים');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [productId, isNewProduct]);
  
  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const totalImages = files.length + imageFiles.length + (isNewProduct ? 0 : imageUrls.length);
      
      if (totalImages > 5) {
        setError('ניתן להעלות עד 5 תמונות');
        return;
      }
      
      setImageFiles([...imageFiles, ...files]);
      
      // Create preview URLs
      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);
    }
  };
  
  // Remove existing image (edit mode only)
  const removeExistingImage = (index: number) => {
    const newUrls = [...imageUrls];
    newUrls.splice(index, 1);
    setImageUrls(newUrls);
  };
  
  // Remove new image
  const removeNewImage = (index: number) => {
    const newFiles = [...imageFiles];
    const newPreviewUrls = [...imagePreviewUrls];
    
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(newPreviewUrls[index]);
    
    newFiles.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    
    setImageFiles(newFiles);
    setImagePreviewUrls(newPreviewUrls);
  };
  
  // Add new variable
  const addVariable = async () => {
    if (!newVariableName.trim() || !newVariableValue.trim()) return;
    
    if (isNewProduct) {
      // For new products, we store variables in state and create them after product creation
      setVariables([
        ...variables,
        { id: uuidv4(), name: newVariableName, value: newVariableValue, product_id: '' }
      ]);
    } else {
      // For existing products, we create variables in the database immediately
      try {
        const newVariable = await createVariable({
          product_id: productId,
          name: newVariableName,
          value: newVariableValue
        });
        
        if (newVariable) {
          setVariables([...variables, newVariable]);
        }
      } catch (err) {
        console.error('Error adding variable:', err);
        setError('אירעה שגיאה בהוספת המשתנה');
      }
    }
    
    setNewVariableName('');
    setNewVariableValue('');
  };
  
  // Remove variable
  const removeVariable = async (id: string) => {
    if (isNewProduct) {
      // For new products, we just remove from state
      setVariables(variables.filter(v => v.id !== id));
    } else {
      // For existing products, we delete from the database
      try {
        const success = await deleteVariable(id);
        if (success) {
          setVariables(variables.filter(v => v.id !== id));
        }
      } catch (err) {
        console.error('Error removing variable:', err);
        setError('אירעה שגיאה במחיקת המשתנה');
      }
    }
  };
  
  // Delete product (edit mode only)
  const handleDeleteProduct = async () => {
    if (isNewProduct) return;
    
    try {
      const success = await deleteProduct(productId);
      if (success) {
        router.push('/admin/dashboard/product');
      } else {
        setError('אירעה שגיאה במחיקת המוצר');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('אירעה שגיאה במחיקת המוצר');
    } finally {
      setShowDeleteDialog(false);
    }
  };
  
  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      // Validate inputs
      if (!name.trim()) throw new Error('שם המוצר הוא שדה חובה');
      if (!price || isNaN(Number(price))) throw new Error('יש להזין מחיר תקין');
      
      if (isNewProduct) {
        // --- Create new product ---
        
        // Create temp product ID for image upload
        const tempProductId = uuidv4();
        
        // Upload images
        const uploadPromises = imageFiles.map(file => uploadProductImage(file, tempProductId));
        const uploadedImageUrls = await Promise.all(uploadPromises);
        
        // Create product
        const newProduct = await createProduct({
          name,
          price: Number(price),
          image_urls: uploadedImageUrls.filter(Boolean) as string[],
          category_id: categoryId === "none" ? undefined : categoryId,
          brand_id: brandId === "none" ? undefined : brandId,
          description: description
        });
        
        if (!newProduct) throw new Error('אירעה שגיאה ביצירת המוצר');
        
        // Add variables if any
        if (variables.length > 0) {
          await Promise.all(
            variables.map(variable => 
              createVariable({
                product_id: newProduct.id,
                name: variable.name,
                value: variable.value
              })
            )
          );
        }
      } else {
        // --- Update existing product ---
        
        // Upload new images if any
        let allImageUrls = [...imageUrls];
        
        if (imageFiles.length > 0) {
          const uploadPromises = imageFiles.map(file => uploadProductImage(file, productId));
          const newImageUrls = await Promise.all(uploadPromises);
          allImageUrls = [...allImageUrls, ...newImageUrls.filter(Boolean) as string[]];
        }
        
        // Update product
        const updatedProduct = await updateProduct(productId, {
          name,
          price: Number(price),
          image_urls: allImageUrls,
          category_id: categoryId === "none" ? undefined : categoryId,
          brand_id: brandId === "none" ? undefined : brandId,
          description: description
        });
        
        if (!updatedProduct) throw new Error('אירעה שגיאה בעדכון המוצר');
      }
      
      // Redirect to product listing
      router.push('/admin/dashboard/product');
      
    } catch (err) {
      console.error(isNewProduct ? 'Error creating product:' : 'Error updating product:', err);
      setError(err instanceof Error ? err.message : (isNewProduct ? 'אירעה שגיאה ביצירת המוצר' : 'אירעה שגיאה בעדכון המוצר'));
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return <div className="text-center py-12">טוען נתונים...</div>;
  }
  
  return (
    <div className="space-y-6 px-2 sm:px-0 ">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-center sm:text-right">
          {isNewProduct ? 'הוספת מוצר חדש' : 'עריכת מוצר'}
        </h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => router.push('/admin/dashboard/product')}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <ArrowRight className="h-4 w-4 mr-1" />
            חזרה לרשימת המוצרים
          </Button>
          {!isNewProduct && (
            <Button 
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <Trash className="h-4 w-4 ml-2" />
              מחק מוצר
            </Button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-md text-center text-sm sm:text-base">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">פרטי מוצר</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProductDetails
              name={name}
              setName={setName}
              price={price}
              setPrice={setPrice}
              description={description}
              setDescription={setDescription}
              categoryId={categoryId}
              setCategoryId={setCategoryId}
              brandId={brandId}
              setBrandId={setBrandId}
              categories={categories}
              brands={brands}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">תמונות מוצר</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductImageUploader
              imageUrls={imageUrls}
              imagePreviewUrls={imagePreviewUrls}
              isNewProduct={isNewProduct}
              removeExistingImage={removeExistingImage}
              removeNewImage={removeNewImage}
              handleImageChange={handleImageChange}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">משתני מוצר (אופציונלי)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProductVariables
              variables={variables}
              addVariable={addVariable}
              removeVariable={removeVariable}
              newVariableName={newVariableName}
              setNewVariableName={setNewVariableName}
              newVariableValue={newVariableValue}
              setNewVariableValue={setNewVariableValue}
            />
          </CardContent>
        </Card>
        
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-end sm:gap-4 px-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/dashboard/product')}
            className="w-full sm:w-auto"
          >
            ביטול
          </Button>
          <Button type="submit" disabled={saving} className="w-full sm:w-auto">
            {saving ? 'שומר...' : (isNewProduct ? 'שמור מוצר' : 'שמור שינויים')}
          </Button>
        </CardFooter>
      </form>
      
      {/* Delete Confirmation Dialog */}
      <DeleteProductDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onDelete={handleDeleteProduct}
      />
    </div>
  );
} 