import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, Check, ArrowUp, Plus, Trash2, X, Upload, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { useGeocoding } from '../hooks/useGeocoding';
import LoadingSpinner from '../components/LoadingSpinner';
import OptimizedImage from '../components/OptimizedImage';
import { 
  compressImages, 
  CompressedImage, 
  isValidImage, 
  formatFileSize,
  ImageCompressionOptions 
} from '../utils/imageUtils';

// Canadian provinces
const CANADIAN_PROVINCES = [
  "Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador",
  "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island",
  "Quebec", "Saskatchewan", "Yukon"
];

// Unit type for rent breakdown
type Unit = {
  id: string;
  unitType: 'Bachelor' | '1 Bedroom' | '2 Bedroom' | '3 Bedroom+' | 'Other';
  rentAmount: number;
  rentCategory: 'Market Value' | 'Under Market Value';
  vacancyStatus: 'Occupied' | 'Vacant';
  projectedRent?: number;
};

// Property data structure matching the Supabase table
type Property = {
  property_title: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  purchase_price: number;
  number_of_units: number;
  property_description: string;
  income_type: 'Estimated' | 'Actual' | 'Mixed';
  tenancy_type: 'On Leases' | 'Month to Month' | 'Mixed';
  units: Unit[];
  property_taxes: number;
  insurance: number;
  hydro: number;
  gas: number;
  water: number;
  waste_management: number;
  maintenance: number;
  management_fees: number;
  miscellaneous: number;
  down_payment_type: 'Percent' | 'Fixed';
  down_payment_amount: number;
  amortization_period: number;
  mortgage_rate: number;
  images: string[];
  agent_name: string;
  agent_email: string;
  agent_phone: string;
};

const PropertyUpload: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { geocodeProperty, isGeocoding, geocodingError } = useGeocoding();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editPropertyId, setEditPropertyId] = useState<string | null>(null);
  const [isLoadingProperty, setIsLoadingProperty] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [property, setProperty] = useState<Property>({
    property_title: '',
    address: '',
    city: '',
    province: 'Ontario',
    postal_code: '',
    purchase_price: 0,
    number_of_units: 1,
    property_description: '',
    income_type: 'Estimated',
    tenancy_type: 'On Leases',
    units: [{
      id: '1',
      unitType: '1 Bedroom',
      rentAmount: 0,
      rentCategory: 'Market Value',
      vacancyStatus: 'Occupied'
    }],
    property_taxes: 0,
    insurance: 0,
    hydro: 0,
    gas: 0,
    water: 0,
    waste_management: 0,
    maintenance: 0,
    management_fees: 0,
    miscellaneous: 0,
    down_payment_type: 'Percent',
    down_payment_amount: 20,
    amortization_period: 25,
    mortgage_rate: 5.5,
    images: [],
    agent_name: user?.user_metadata?.full_name || '',
    agent_email: user?.email || '',
    agent_phone: ''
  });
  
  // Image upload state
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [compressedImages, setCompressedImages] = useState<CompressedImage[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionStats, setCompressionStats] = useState<{
    originalSize: number;
    compressedSize: number;
    totalSavings: number;
  }>({ originalSize: 0, compressedSize: 0, totalSavings: 0 });
  
  // Check for edit mode and load property data
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && user) {
      setEditPropertyId(editId);
      loadPropertyForEdit(editId);
    }
  }, [searchParams, user]);

  // Load property data for editing
  const loadPropertyForEdit = async (propertyId: string) => {
    try {
      setIsLoadingProperty(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .eq('user_id', user!.id)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      if (data) {
        // Transform the data to match our Property type
        const transformedProperty: Property = {
          property_title: data.property_title,
          address: data.address,
          city: data.city,
          province: data.province,
          postal_code: data.postal_code || '',
          purchase_price: Number(data.purchase_price) || 0,
          number_of_units: Number(data.number_of_units) || 0,
          property_description: data.property_description || '',
          income_type: data.income_type as 'Estimated' | 'Actual' | 'Mixed' || 'Estimated',
          tenancy_type: data.tenancy_type as 'On Leases' | 'Month to Month' | 'Mixed' || 'On Leases',
          units: Array.isArray(data.units) ? data.units.map((unit: any) => ({
            id: unit.id || '',
            unitType: unit.unitType || 'Other',
            rentAmount: Number(unit.rentAmount) || 0,
            rentCategory: unit.rentCategory || 'Market Value',
            vacancyStatus: unit.vacancyStatus || 'Occupied',
            projectedRent: Number(unit.projectedRent) || undefined
          })) : [],
          property_taxes: Number(data.property_taxes) || 0,
          insurance: Number(data.insurance) || 0,
          hydro: Number(data.hydro) || 0,
          gas: Number(data.gas) || 0,
          water: Number(data.water) || 0,
          waste_management: Number(data.waste_management) || 0,
          maintenance: Number(data.maintenance) || 0,
          management_fees: Number(data.management_fees) || 0,
          miscellaneous: Number(data.miscellaneous) || 0,
          down_payment_type: data.down_payment_type as 'Percent' | 'Fixed' || 'Percent',
          down_payment_amount: Number(data.down_payment_amount) || 20,
          amortization_period: Number(data.amortization_period) || 25,
          mortgage_rate: Number(data.mortgage_rate) || 4.0,
          images: Array.isArray(data.images) ? data.images as string[] : [],
          agent_name: data.agent_name || '',
          agent_email: data.agent_email || '',
          agent_phone: data.agent_phone || ''
        };

        setProperty(transformedProperty);
      }
    } catch (err) {
      console.error('Error loading property for edit:', err);
      setError(err instanceof Error ? err.message : 'Failed to load property data');
    } finally {
      setIsLoadingProperty(false);
    }
  };
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Convert numeric fields to numbers
    const numericFields = [
      'purchase_price', 'number_of_units', 'property_taxes', 'insurance', 'hydro', 'gas', 
      'water', 'waste_management', 'maintenance', 'management_fees', 'miscellaneous',
      'down_payment_amount', 'amortization_period', 'mortgage_rate'
    ];
    const newValue = numericFields.includes(name) ? parseFloat(value) || 0 : value;
    
    setProperty(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  // Handle unit changes
  const handleUnitChange = (unitId: string, field: keyof Unit, value: string | number) => {
    setProperty(prev => ({
      ...prev,
      units: prev.units.map(unit => 
        unit.id === unitId ? { ...unit, [field]: value } : unit
      )
    }));
  };

  // Add new unit
  const addUnit = () => {
    const newUnit: Unit = {
      id: Date.now().toString(),
      unitType: '1 Bedroom',
      rentAmount: 0,
      rentCategory: 'Market Value',
      vacancyStatus: 'Occupied'
    };
    setProperty(prev => ({
      ...prev,
      units: [...prev.units, newUnit]
    }));
  };

  // Remove unit
  const removeUnit = (unitId: string) => {
    setProperty(prev => ({
      ...prev,
      units: prev.units.filter(unit => unit.id !== unitId)
    }));
  };
  
  // Handle image selection and compression
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const newFiles = Array.from(e.target.files);
    
    // Check if adding these would exceed the 30 image limit
    const totalImages = property.images.length + imageFiles.length + newFiles.length;
    if (totalImages > 30) {
      setError('Maximum of 30 images allowed');
      return;
    }

    // Validate file types
    const invalidFiles = newFiles.filter(file => !isValidImage(file));
    if (invalidFiles.length > 0) {
      setError(`Invalid file types: ${invalidFiles.map(f => f.name).join(', ')}`);
      return;
    }

    // Check file sizes (before compression)
    const oversizedFiles = newFiles.filter(file => file.size > 10 * 1024 * 1024); // 10MB limit
    if (oversizedFiles.length > 0) {
      setError(`Files too large (max 10MB): ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }

    try {
      setIsCompressing(true);
      setError(null);

      // Compression options for property images
      const compressionOptions: ImageCompressionOptions = {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.85,
        format: 'webp',
        maxSizeKB: 300 // Target 300KB per image
      };

      // Compress images
      const compressed = await compressImages(newFiles, compressionOptions);
      
      // Update states
      setImageFiles(prev => [...prev, ...newFiles]);
      setCompressedImages(prev => [...prev, ...compressed]);

      // Calculate compression statistics
      const originalSize = compressed.reduce((sum, img) => sum + img.originalSize, 0);
      const compressedSize = compressed.reduce((sum, img) => sum + img.compressedSize, 0);
      const totalSavings = originalSize - compressedSize;

      setCompressionStats(prev => ({
        originalSize: prev.originalSize + originalSize,
        compressedSize: prev.compressedSize + compressedSize,
        totalSavings: prev.totalSavings + totalSavings
      }));

      console.log(`Compressed ${compressed.length} images:`, {
        originalSize: formatFileSize(originalSize),
        compressedSize: formatFileSize(compressedSize),
        savings: formatFileSize(totalSavings),
        compressionRatio: Math.round((totalSavings / originalSize) * 100) + '%'
      });

    } catch (err) {
      console.error('Image compression failed:', err);
      setError('Failed to compress images. Please try again.');
    } finally {
      setIsCompressing(false);
    }
  };
  
  // Remove existing property image
  const removeExistingImage = (index: number) => {
    setProperty(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };
  
  // Remove selected image
  const removeSelectedImage = (index: number) => {
    const removedCompressed = compressedImages[index];
    
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setCompressedImages(prev => prev.filter((_, i) => i !== index));
    
    // Update compression stats
    if (removedCompressed) {
      setCompressionStats(prev => ({
        originalSize: prev.originalSize - removedCompressed.originalSize,
        compressedSize: prev.compressedSize - removedCompressed.compressedSize,
        totalSavings: prev.totalSavings - (removedCompressed.originalSize - removedCompressed.compressedSize)
      }));
    }
  };
  
  // Upload compressed images to Supabase Storage
  const uploadImages = async (): Promise<string[]> => {
    if (compressedImages.length === 0) {
      return []; // Return empty array if no new images to upload
    }
    
    const uploadedUrls: string[] = [];
    
    try {
      console.log('Starting compressed image uploads to bucket: property_images');
      console.log(`Uploading ${compressedImages.length} compressed images (${formatFileSize(compressionStats.compressedSize)} total)`);
      
      for (let i = 0; i < compressedImages.length; i++) {
        const compressed = compressedImages[i];
        const file = compressed.file;
        const originalFile = imageFiles[i];
        
        // Use WebP extension for compressed files
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.webp`;
        const filePath = `${user!.id}/${fileName}`;
        
        console.log(`Uploading compressed file ${i + 1}/${compressedImages.length}: ${originalFile.name} → ${fileName}`);
        console.log(`Size: ${formatFileSize(compressed.originalSize)} → ${formatFileSize(compressed.compressedSize)} (${compressed.compressionRatio}% savings)`);
        
        // Upload compressed file to Supabase Storage
        const { data, error } = await supabase.storage
          .from('property_images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (error) {
          console.error('Storage upload error:', error);
          throw new Error(`Failed to upload ${originalFile.name}: ${error.message}`);
        }
        
        if (data) {
          console.log('Upload successful:', data);
          
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('property_images')
            .getPublicUrl(data.path);
          
          console.log('Public URL generated:', urlData.publicUrl);
          uploadedUrls.push(urlData.publicUrl);
          
          // Update progress
          setUploadProgress(prev => ({
            ...prev,
            [originalFile.name]: 100
          }));
        }
      }
      
      console.log('All compressed uploads completed. URLs:', uploadedUrls);
      console.log(`Total compression savings: ${formatFileSize(compressionStats.totalSavings)} (${Math.round((compressionStats.totalSavings / compressionStats.originalSize) * 100)}%)`);
      return uploadedUrls;
    } catch (err: unknown) {
      console.error('Error uploading compressed images:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to upload images: ${errorMessage}`);
      throw err;
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to add properties');
      return;
    }
    
    console.log('Form submission started. User:', user.id);
    
    // Validation
    if (property.property_description.length > 2000) {
      setError('Property description must be 2000 characters or less');
      return;
    }

    if (property.units.length === 0) {
      setError('At least one unit is required');
      return;
    }
    
    // Validation - check total images including existing ones
    const totalImages = property.images.length + imageFiles.length;
    if (totalImages === 0) {
      setError('At least one property image is required');
      return;
    }
    
    // Validate projectedRent for vacant units
    for (const unit of property.units) {
      if (unit.vacancyStatus === 'Vacant' && (!unit.projectedRent || unit.projectedRent <= 0)) {
        setError('Projected rent is required for vacant units');
        return;
      }
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // 1. Upload new images if any
      let newImageUrls: string[] = [];
      if (imageFiles.length > 0) {
        console.log('Starting image uploads...');
        newImageUrls = await uploadImages();
        console.log('Uploaded new image URLs:', newImageUrls);
      }
      
      // 2. Combine existing and new image URLs
      const allImageUrls = [...property.images, ...newImageUrls];
      
      // 3. Add user_id and all image URLs to property data
      const propertyData = {
        ...property,
        user_id: user.id,
        images: allImageUrls
      };
      
      console.log('Prepared property data:', propertyData);
      
      // 4. Insert or update property in Supabase
      console.log('Sending data to Supabase...');
      let data, supabaseError;
      
      if (editPropertyId) {
        // Update existing property
        const result = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', editPropertyId)
          .eq('user_id', user.id)
          .select();
        data = result.data;
        supabaseError = result.error;
      } else {
        // Insert new property
        const result = await supabase
          .from('properties')
          .insert(propertyData)
          .select();
        data = result.data;
        supabaseError = result.error;
      }
      
      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        throw new Error(`Database error: ${supabaseError.message}`);
      }
      
      if (!data || data.length === 0) {
        throw new Error('Failed to create property record');
      }
      
      const insertedProperty = data[0];
      console.log('Property inserted successfully:', insertedProperty);
      
      // 5. Geocode the property address in the background
      console.log('Starting geocoding process...');
      const geocodeResult = await geocodeProperty(
        insertedProperty.id,
        property.address,
        property.city,
        property.province,
        property.postal_code
      );
      
      if (geocodeResult.success) {
        console.log('Property geocoded successfully');
      } else {
        console.warn('Geocoding failed, but property was saved:', geocodeResult.error);
        // Don't fail the entire operation if geocoding fails
      }
      
      setSuccess(editPropertyId ? 'Property updated successfully!' : 'Property added successfully!');
      
      // Redirect to property sheet after a brief delay
      setTimeout(() => {
        navigate('/properties');
      }, 2000);
      
    } catch (err: unknown) {
      console.error('Error adding property:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to ${editPropertyId ? 'update' : 'add'} property: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Show combined loading state for both property creation and geocoding
  const isProcessing = isLoading || isGeocoding || isLoadingProperty;
  const loadingMessage = isLoadingProperty ? "Loading property data..." : isGeocoding ? "Geocoding address..." : isLoading ? `${editPropertyId ? 'Updating' : 'Saving'} property...` : "Processing...";
  
  return (
    <div className="pt-16 md:pt-20 pb-16">
      <LoadingSpinner 
        isVisible={isProcessing}
        message={loadingMessage}
        variant="overlay"
      />
      
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-primary-700 mb-2">
            {editPropertyId ? 'Edit Property' : 'Add New Property'}
          </h1>
          <p className="text-gray-600">
            {editPropertyId 
              ? 'Update the property details below.' 
              : 'Enter comprehensive property details to add it to your portfolio.'}
          </p>
        </div>
        
        {(error || geocodingError) && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
            <span>{error || geocodingError}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
            <Check className="h-5 w-5 text-green-400 mr-2 mt-0.5" />
            <span>{success}</span>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">1. Property Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="property_title" className="block text-sm font-medium text-gray-700 mb-1">
                    Property Title *
                  </label>
                  <input
                    type="text"
                    id="property_title"
                    name="property_title"
                    value={property.property_title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="purchase_price" className="block text-sm font-medium text-gray-700 mb-1">
                    Purchase Price ($) *
                  </label>
                  <input
                    type="number"
                    id="purchase_price"
                    name="purchase_price"
                    value={property.purchase_price || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Property Address *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={property.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={property.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                    Province *
                  </label>
                  <select
                    id="province"
                    name="province"
                    value={property.province}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    {CANADIAN_PROVINCES.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    id="postal_code"
                    name="postal_code"
                    value={property.postal_code}
                    onChange={handleChange}
                    pattern="[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d"
                    title="Valid Canadian postal code format"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="number_of_units" className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Units *
                  </label>
                  <input
                    type="number"
                    id="number_of_units"
                    name="number_of_units"
                    value={property.number_of_units || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="income_type" className="block text-sm font-medium text-gray-700 mb-1">
                    Income Type *
                  </label>
                  <select
                    id="income_type"
                    name="income_type"
                    value={property.income_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="Estimated">Projected Income</option>
                    <option value="Actual">Actual</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="tenancy_type" className="block text-sm font-medium text-gray-700 mb-1">
                    Tenancy Type *
                  </label>
                  <select
                    id="tenancy_type"
                    name="tenancy_type"
                    value={property.tenancy_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="On Leases">On Leases</option>
                    <option value="Month to Month">Month to Month</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="property_description" className="block text-sm font-medium text-gray-700 mb-1">
                  Property Description (max 2000 characters)
                </label>
                <textarea
                  id="property_description"
                  name="property_description"
                  value={property.property_description}
                  onChange={handleChange}
                  rows={4}
                  maxLength={2000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Describe the property..."
                />
                <div className="text-sm text-gray-500 mt-1">
                  {property.property_description.length}/2000 characters
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">2. Unit-by-Unit Rent Breakdown</h2>
                <button
                  type="button"
                  onClick={addUnit}
                  className="bg-primary-500 text-white px-3 py-1 rounded text-sm flex items-center hover:bg-primary-600"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Unit
                </button>
              </div>
              
              {property.units.map((unit, index) => (
                <div key={unit.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-800">Unit {index + 1}</h3>
                    {property.units.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeUnit(unit.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit Type *
                      </label>
                      <select
                        value={unit.unitType}
                        onChange={(e) => handleUnitChange(unit.id, 'unitType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        required
                      >
                        <option value="Bachelor">Bachelor</option>
                        <option value="1 Bedroom">1 Bedroom</option>
                        <option value="2 Bedroom">2 Bedroom</option>
                        <option value="3 Bedroom+">3 Bedroom+</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rent Amount ($) *
                      </label>
                      <input
                        type="number"
                        value={unit.rentAmount || ''}
                        onChange={(e) => handleUnitChange(unit.id, 'rentAmount', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rent Category *
                      </label>
                      <select
                        value={unit.rentCategory}
                        onChange={(e) => handleUnitChange(unit.id, 'rentCategory', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        required
                      >
                        <option value="Market Value">Market Value</option>
                        <option value="Under Market Value">Under Market Value</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vacancy Status *
                      </label>
                      <select
                        value={unit.vacancyStatus}
                        onChange={(e) => handleUnitChange(unit.id, 'vacancyStatus', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        required
                      >
                        <option value="Occupied">Occupied</option>
                        <option value="Vacant">Vacant</option>
                      </select>
                    </div>
                  </div>
                  
                  {unit.vacancyStatus === 'Vacant' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Projected Rent ($) *
                        </label>
                        <input
                          type="number"
                          value={unit.projectedRent || ''}
                          onChange={(e) => handleUnitChange(unit.id, 'projectedRent', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">3. Owner-Paid Costs</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="property_taxes" className="block text-sm font-medium text-gray-700 mb-1">
                    Property Taxes ($)
                  </label>
                  <input
                    type="number"
                    id="property_taxes"
                    name="property_taxes"
                    value={property.property_taxes || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="insurance" className="block text-sm font-medium text-gray-700 mb-1">
                    Insurance ($)
                  </label>
                  <input
                    type="number"
                    id="insurance"
                    name="insurance"
                    value={property.insurance || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="hydro" className="block text-sm font-medium text-gray-700 mb-1">
                    Hydro ($)
                  </label>
                  <input
                    type="number"
                    id="hydro"
                    name="hydro"
                    value={property.hydro || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="gas" className="block text-sm font-medium text-gray-700 mb-1">
                    Gas ($)
                  </label>
                  <input
                    type="number"
                    id="gas"
                    name="gas"
                    value={property.gas || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="water" className="block text-sm font-medium text-gray-700 mb-1">
                    Water ($)
                  </label>
                  <input
                    type="number"
                    id="water"
                    name="water"
                    value={property.water || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="waste_management" className="block text-sm font-medium text-gray-700 mb-1">
                    Waste Management ($)
                  </label>
                  <input
                    type="number"
                    id="waste_management"
                    name="waste_management"
                    value={property.waste_management || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="maintenance" className="block text-sm font-medium text-gray-700 mb-1">
                    Maintenance ($)
                  </label>
                  <input
                    type="number"
                    id="maintenance"
                    name="maintenance"
                    value={property.maintenance || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="management_fees" className="block text-sm font-medium text-gray-700 mb-1">
                    Management Fees ($)
                  </label>
                  <input
                    type="number"
                    id="management_fees"
                    name="management_fees"
                    value={property.management_fees || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="miscellaneous" className="block text-sm font-medium text-gray-700 mb-1">
                    Miscellaneous ($)
                  </label>
                  <input
                    type="number"
                    id="miscellaneous"
                    name="miscellaneous"
                    value={property.miscellaneous || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">4. Mortgage Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="down_payment_type" className="block text-sm font-medium text-gray-700 mb-1">
                    Down Payment Type *
                  </label>
                  <select
                    id="down_payment_type"
                    name="down_payment_type"
                    value={property.down_payment_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="Percent">Percent</option>
                    <option value="Fixed">Fixed</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="down_payment_amount" className="block text-sm font-medium text-gray-700 mb-1">
                    Down Payment {property.down_payment_type === 'Percent' ? '(%)' : '($)'} *
                  </label>
                  <input
                    type="number"
                    id="down_payment_amount"
                    name="down_payment_amount"
                    value={property.down_payment_amount || ''}
                    onChange={handleChange}
                    max={property.down_payment_type === 'Percent' ? 100 : undefined}
                    step={property.down_payment_type === 'Percent' ? 0.1 : 1000}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="amortization_period" className="block text-sm font-medium text-gray-700 mb-1">
                    Amortization Period (Years) *
                  </label>
                  <input
                    type="number"
                    id="amortization_period"
                    name="amortization_period"
                    value={property.amortization_period || ''}
                    onChange={handleChange}
                    max={40}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="mortgage_rate" className="block text-sm font-medium text-gray-700 mb-1">
                    Mortgage Rate (%) *
                  </label>
                  <input
                    type="number"
                    id="mortgage_rate"
                    name="mortgage_rate"
                    value={property.mortgage_rate || ''}
                    onChange={handleChange}
                    max={20}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">5. Image Upload</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Images (1-30 images) *
                </label>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={isCompressing}
                  />
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isCompressing}
                    className="flex flex-col items-center space-y-2 mx-auto disabled:opacity-50"
                  >
                    {isCompressing ? (
                      <>
                        <Zap className="h-8 w-8 text-primary-500 animate-pulse" />
                        <span className="text-sm text-primary-600 font-medium">
                          Compressing images...
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          Click to upload images 
                          <span className="text-primary-500 font-medium"> (Max 30)</span>
                        </span>
                        <span className="text-xs text-gray-400">
                          JPEG, PNG or GIF up to 10MB each
                        </span>
                      </>
                    )}
                  </button>
                </div>
                
                {(property.images.length > 0 || imageFiles.length > 0) && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-700">
                        Property Images: {property.images.length + imageFiles.length}/30
                      </h4>
                      
                      {compressionStats.totalSavings > 0 && (
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="text-green-600 font-medium">
                            💾 {formatFileSize(compressionStats.totalSavings)} saved
                          </span>
                          <span className="text-gray-500">
                            ({Math.round((compressionStats.totalSavings / compressionStats.originalSize) * 100)}% reduction)
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-2">
                      {/* Existing property images */}
                      {property.images.map((imageUrl, index) => (
                        <div key={`existing-${index}`} className="relative group">
                          <div className="h-24 w-full rounded border overflow-hidden bg-gray-50">
                            <OptimizedImage
                              src={imageUrl}
                              alt={`Property image ${index + 1}`}
                              className="h-full w-full object-cover"
                              placeholder="skeleton"
                              priority={index < 6}
                            />
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          
                          <div className="mt-1">
                            <span className="text-xs text-blue-600 font-medium block">
                              Existing Image
                            </span>
                          </div>
                        </div>
                      ))}
                      
                      {/* Newly selected images */}
                      {imageFiles.map((file, index) => {
                        const compressed = compressedImages[index];
                        return (
                          <div key={`new-${index}`} className="relative group">
                            <div className="h-24 w-full rounded border overflow-hidden bg-gray-50">
                              <OptimizedImage
                                src={compressed?.dataUrl || URL.createObjectURL(file)}
                                alt={`New property image ${index + 1}`}
                                className="h-full w-full object-cover"
                                placeholder="skeleton"
                                priority={index < 6}
                              />
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => removeSelectedImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            
                            <div className="mt-1 space-y-1">
                              <span className="text-xs text-gray-500 truncate block">
                                {file.name}
                              </span>
                              
                              {compressed && (
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-green-600 font-medium">
                                    WebP
                                  </span>
                                  <span className="text-gray-500">
                                    {formatFileSize(compressed.compressedSize)}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {uploadProgress[file.name] && (
                              <div className="mt-1 h-1 w-full bg-gray-200 rounded overflow-hidden">
                                <div 
                                  className="h-full bg-primary-500 transition-all duration-300" 
                                  style={{ width: `${uploadProgress[file.name]}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">6. Agent Contact Info</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="agent_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="agent_name"
                    name="agent_name"
                    value={property.agent_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="agent_email" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    id="agent_email"
                    name="agent_email"
                    value={property.agent_email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="agent_phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="agent_phone"
                    name="agent_phone"
                    value={property.agent_phone}
                    onChange={handleChange}
                    pattern="[0-9\-\(\)\+\s]+"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-8">
              <button
                type="button"
                onClick={() => navigate('/properties')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className={`px-6 py-2 rounded text-white flex items-center ${
                  isProcessing ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {isProcessing ? loadingMessage : (
                  <>
                    <ArrowUp className="h-4 w-4 mr-2" />
                    Add Property
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PropertyUpload;
