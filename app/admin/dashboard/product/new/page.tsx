'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  createProduct, 
  uploadProductImage,
  getCategories,
  getBrands,
  createVariable,
  type Category,
  type Brand
} from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Plus, X, Upload, ArrowRight } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function NewProductPage() {
  const router = useRouter();
  
  // Form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('none');
  const [brandId, setBrandId] = useState('none');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [variables, setVariables] = useState<{id: string, name: string, value: string}[]>([]);
  const [newVariableName, setNewVariableName] = useState('');
  const [newVariableValue, setNewVariableValue] = useState('');
  
  // Dropdown options
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Fetch categories and brands
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, brandsData] = await Promise.all([
          getCategories(),
          getBrands(),
        ]);
        setCategories(categoriesData);
        setBrands(brandsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('אירעה שגיאה בטעינת הנתונים');
      }
    };
    
    fetchData();
  }, []);
  
  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length + imageFiles.length > 5) {
        setError('ניתן להעלות עד 5 תמונות');
        return;
      }
      
      setImageFiles([...imageFiles, ...files]);
      
      // Create preview URLs
      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);
    }
  };
  
  // Remove image
  const removeImage = (index: number) => {
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
  const addVariable = () => {
    if (!newVariableName.trim() || !newVariableValue.trim()) return;
    
    setVariables([
      ...variables,
      { id: uuidv4(), name: newVariableName, value: newVariableValue }
    ]);
    
    setNewVariableName('');
    setNewVariableValue('');
  };
  
  // Remove variable
  const removeVariable = (id: string) => {
    setVariables(variables.filter(v => v.id !== id));
  };
  
  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Validate inputs
      if (!name.trim()) throw new Error('שם המוצר הוא שדה חובה');
      if (!price || isNaN(Number(price))) throw new Error('יש להזין מחיר תקין');
      
      // Create temp product ID for image upload
      const tempProductId = uuidv4();
      
      // Upload images
      const uploadPromises = imageFiles.map(file => uploadProductImage(file, tempProductId));
      const imageUrls = await Promise.all(uploadPromises);
      
      // Create product
      const newProduct = await createProduct({
        name,
        price: Number(price),
        image_urls: imageUrls.filter(Boolean) as string[],
        category_id: categoryId === "none" ? undefined : categoryId,
        brand_id: brandId === "none" ? undefined : brandId
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
      
      // Redirect to product listing
      router.push('/admin/dashboard/product');
      
    } catch (err) {
      console.error('Error creating product:', err);
      setError(err instanceof Error ? err.message : 'אירעה שגיאה ביצירת המוצר');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">הוספת מוצר חדש</h1>
        <Button 
          variant="outline" 
          onClick={() => router.push('/admin/dashboard/product')}
          className="flex items-center gap-2"
        >
          חזרה לרשימת המוצרים
          <ArrowRight className="h-4 w-4 mr-1" />
        </Button>
      </div>
      
      {error && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>פרטי מוצר</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">שם המוצר *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="הזן שם מוצר"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">מחיר (₪) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="הזן מחיר"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">קטגוריה</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר קטגוריה" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">ללא קטגוריה</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="brand">מותג</Label>
                <Select value={brandId} onValueChange={setBrandId}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר מותג" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">ללא מותג</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">תיאור המוצר</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="הזן תיאור מוצר"
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>תמונות מוצר</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative rounded-md overflow-hidden">
                    <Image
                      src={url}
                      alt={`Preview ${index + 1}`}
                      width={120}
                      height={120}
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                
                {imagePreviewUrls.length < 5 && (
                  <Label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-[120px] h-[120px] border-2 border-dashed rounded-md cursor-pointer hover:border-primary"
                  >
                    <Upload className="h-6 w-6 mb-2" />
                    <span className="text-sm">העלה תמונה</span>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={handleImageChange}
                    />
                  </Label>
                )}
              </div>
              <p className="text-sm text-muted-foreground">ניתן להעלות עד 5 תמונות. פורמטים נתמכים: JPG, PNG.</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>משתני מוצר (אופציונלי)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="variable-name">שם המשתנה</Label>
                <Input
                  id="variable-name"
                  value={newVariableName}
                  onChange={(e) => setNewVariableName(e.target.value)}
                  placeholder="לדוגמה: צבע, גודל, משקל"
                />
              </div>
              
              <div className="flex-1 space-y-2">
                <Label htmlFor="variable-value">ערך</Label>
                <Input
                  id="variable-value"
                  value={newVariableValue}
                  onChange={(e) => setNewVariableValue(e.target.value)}
                  placeholder="לדוגמה: אדום, XL, 500 גרם"
                />
              </div>
              
              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={addVariable}
                  disabled={!newVariableName.trim() || !newVariableValue.trim()}
                >
                  <Plus className="h-4 w-4 ml-2" />
                  הוסף
                </Button>
              </div>
            </div>
            
            {variables.length > 0 && (
              <div className="border rounded-md mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>שם המשתנה</TableHead>
                      <TableHead>ערך</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variables.map((variable) => (
                      <TableRow key={variable.id}>
                        <TableCell>{variable.name}</TableCell>
                        <TableCell>{variable.value}</TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeVariable(variable.id)}
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        
        <CardFooter className="flex justify-end gap-4 px-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/dashboard/product')}
          >
            ביטול
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'שומר...' : 'שמור מוצר'}
          </Button>
        </CardFooter>
      </form>
    </div>
  );
} 