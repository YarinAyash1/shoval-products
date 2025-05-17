import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Product Types
export type Product = {
    id: string;
    name: string;
    price: number;
    image_urls: string[];
    category_id?: string;
    brand_id?: string;
    description?: string;
    created_at?: string;
    category?: Category;
    brand?: Brand;
    variables?: Variable[];
};

export type Category = {
    id: string;
    name: string;
};

export type Brand = {
    id: string;
    name: string;
};

export type Variable = {
    id: string;
    product_id: string;
    name: string;
    value: string;
};

export type Settings = {
    id: string;
    contact_phone: string | null;
};

// Products API
export async function getProducts() {
    const { data, error } = await supabase
        .from('products')
        .select(`
      *,
      category:categories(id, name),
      brand:brands(id, name)
    `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }
    return data || [];
}

export async function getProductById(id: string) {
    const { data: product, error: productError } = await supabase
        .from('products')
        .select(`
      *,
      category:categories(id, name),
      brand:brands(id, name)
    `)
        .eq('id', id)
        .single();

    if (productError) {
        console.error('Error fetching product:', productError);
        return null;
    }

    // Get variables for this product
    const { data: variables, error: variablesError } = await supabase
        .from('variables')
        .select('*')
        .eq('product_id', id);

    if (variablesError) {
        console.error('Error fetching variables:', variablesError);
    }

    return {
        ...product,
        variables: variables || [],
    };
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at'>) {
    const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

    if (error) {
        console.error('Error creating product:', error);
        return null;
    }
    return data;
}

export async function updateProduct(id: string, updates: Partial<Product>) {
    const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating product:', error);
        return null;
    }
    return data;
}

export async function deleteProduct(id: string) {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting product:', error);
        return false;
    }
    return true;
}

// Categories API
export async function getCategories() {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
    return data || [];
}

export async function createCategory(name: string) {
    const { data, error } = await supabase
        .from('categories')
        .insert({ name })
        .select()
        .single();

    if (error) {
        console.error('Error creating category:', error);
        return null;
    }
    return data;
}

export async function updateCategory(id: string, name: string) {
    const { data, error } = await supabase
        .from('categories')
        .update({ name })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating category:', error);
        return null;
    }
    return data;
}

export async function deleteCategory(id: string) {
    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting category:', error);
        return false;
    }
    return true;
}

// Brands API
export async function getBrands() {
    const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name');

    if (error) {
        console.error('Error fetching brands:', error);
        return [];
    }
    return data || [];
}

export async function createBrand(name: string) {
    const { data, error } = await supabase
        .from('brands')
        .insert({ name })
        .select()
        .single();

    if (error) {
        console.error('Error creating brand:', error);
        return null;
    }
    return data;
}

export async function updateBrand(id: string, name: string) {
    const { data, error } = await supabase
        .from('brands')
        .update({ name })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating brand:', error);
        return null;
    }
    return data;
}

export async function deleteBrand(id: string) {
    const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting brand:', error);
        return false;
    }
    return true;
}

// Variables API
export async function createVariable(variable: Omit<Variable, 'id'>) {
    const { data, error } = await supabase
        .from('variables')
        .insert(variable)
        .select()
        .single();

    if (error) {
        console.error('Error creating variable:', error);
        return null;
    }
    return data;
}

export async function deleteVariable(id: string) {
    const { error } = await supabase
        .from('variables')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting variable:', error);
        return false;
    }
    return true;
}

// Auth helpers
export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        throw error;
    }

    return data;
}

export async function signOut() {
    return supabase.auth.signOut();
}

export async function getCurrentUser() {
    const { data } = await supabase.auth.getSession();
    return data?.session?.user;
}

const bucketName = process.env.NEXT_PUBLIC_STORAGE || 'products-images';

// Storage helpers for images
export async function uploadProductImage(file: File, productId: string) {
    try {
        // Validate file
        if (!file) {
            console.error('No file provided');
            return null;
        }

        // Check file size (limit to 2MB)
        const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
        if (file.size > MAX_FILE_SIZE) {
            console.error(`File too large (${file.size} bytes). Maximum size is ${MAX_FILE_SIZE} bytes.`);
            return null;
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            console.error(`Invalid file type: ${file.type}. Allowed types: ${validTypes.join(', ')}`);
            return null;
        }

        // Generate file name
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${productId}-${Date.now()}.${fileExt}`;
        const filePath = fileName;

        console.log('Uploading file:', {
            name: file.name,
            size: file.size,
            type: file.type,
            path: filePath
        });

        // Try to upload with public access
        const { error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
                upsert: true,
                cacheControl: '3600',
                contentType: file.type
            });

        if (error) {
            console.error('Error uploading image:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            
            if (error.message?.includes('row-level security') || 
                error.message?.includes('Unauthorized') ||
                error.message?.includes('Permission denied')) {
                console.error('This is likely due to Row-Level Security (RLS) policies in your Supabase project.');
                console.error('Go to Supabase Dashboard > Storage > Policies and add the following policy:');
                console.error(`
For INSERT operations:
Policy name: "Allow authenticated uploads"
Policy definition: (auth.role() = 'authenticated')

For SELECT operations:
Policy name: "Allow public access"
Policy definition: true
                `);
            }
            return null;
        }

        // Get public URL
        const { data } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        console.log('Upload successful, public URL:', data.publicUrl);
        return data.publicUrl;
    } catch (err) {
        console.error('Error in uploadProductImage:', err);
        return null;
    }
}

// Settings API
// Make sure you're retrieving the session before making settings API calls
export async function getSettings() {
    const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching settings:', error);
        return null;
    }

    return data as Settings || null;
}

export async function updateSettings(updates: Partial<Settings>) {
    // First check if settings exist
    const settings = await getSettings();

    if (settings) {
        // Update existing settings
        const { data, error } = await supabase
            .from('settings')
            .update(updates)
            .eq('id', settings.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating settings:', error);
            return null;
        }
        return data;
    } else {
        // Create new settings
        const { data, error } = await supabase
            .from('settings')
            .insert({ ...updates })
            .select()
            .single();

        if (error) {
            console.error('Error creating settings:', error);
            return null;
        }
        return data;
    }
}