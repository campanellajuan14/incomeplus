
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Download, File, X, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../integrations/supabase/client';

type Property = {
  id?: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;  // Changed from zipCode to zipcode
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  yearbuilt: number;  // Changed from yearBuilt to yearbuilt
  caprate: number;    // Changed from capRate to caprate
  cashflow: number;   // Changed from cashFlow to cashflow
  cocreturn: number;  // Changed from cocReturn to cocreturn
  user_id: string;
  created_at?: string;
};

const PropertySheet: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/auth');
      return;
    }

    // Fetch properties from Supabase
    fetchProperties();
  }, [user, navigate]);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProperties(data || []);
    } catch (err: any) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const processCSV = (text: string) => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    const newProperties: Property[] = [];
    
    // Start from index 1 to skip the header row
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // Skip empty lines
      
      const values = lines[i].split(',').map(value => value.trim());
      
      // Create a property object by mapping headers to values
      const property: any = {};
      headers.forEach((header, index) => {
        let value = values[index];
        
        // Map the camelCase properties to snake_case for database compatibility
        const fieldName = header === 'zipCode' ? 'zipcode' : 
                          header === 'yearBuilt' ? 'yearbuilt' :
                          header === 'capRate' ? 'caprate' :
                          header === 'cashFlow' ? 'cashflow' :
                          header === 'cocReturn' ? 'cocreturn' : header;
        
        // Convert numeric values
        if (['price', 'bedrooms', 'bathrooms', 'sqft', 'yearbuilt', 'caprate', 'cashflow', 'cocreturn'].includes(fieldName)) {
          property[fieldName] = parseFloat(value) || 0;
        } else {
          property[fieldName] = value || '';
        }
      });
      
      // Add user_id
      property.user_id = user?.id || '';
      
      newProperties.push(property as Property);
    }
    
    return newProperties;
  };

  const handleImport = async () => {
    if (!file) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        const newProperties = processCSV(text);
        
        if (newProperties.length === 0) {
          setError('No valid properties found in the file.');
          setIsLoading(false);
          return;
        }
        
        // Insert properties into Supabase
        const { error } = await supabase
          .from('properties')
          .insert(newProperties);
          
        if (error) throw error;
        
        await fetchProperties(); // Refresh the list
        setSuccess(`Successfully imported ${newProperties.length} properties.`);
        setShowImportModal(false);
        setFile(null);
      };
      
      reader.readAsText(file);
    } catch (err: any) {
      console.error('Error importing properties:', err);
      setError('Failed to import properties: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (properties.length === 0) {
      setError('No properties to export.');
      return;
    }
    
    // Create CSV header - use original column names for export
    const headers = ['address', 'city', 'state', 'zipcode', 'price', 'bedrooms', 'bathrooms', 'sqft', 'yearbuilt', 'caprate', 'cashflow', 'cocreturn'];
    let csv = headers.join(',') + '\n';
    
    // Add property data
    properties.forEach(property => {
      const row = headers.map(header => {
        // @ts-ignore
        return property[header] || '';
      });
      csv += row.join(',') + '\n';
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'properties.csv');
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTemplate = () => {
    // Create CSV template
    const headers = ['address', 'city', 'state', 'zipcode', 'price', 'bedrooms', 'bathrooms', 'sqft', 'yearbuilt', 'caprate', 'cashflow', 'cocreturn'];
    const template = headers.join(',') + '\n' + 
      '123 Main St,Anytown,CA,12345,250000,3,2,1500,2005,5.5,250,8.2';
    
    // Create download link
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'property_template.csv');
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pt-16 md:pt-20 pb-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-primary-700 mb-2">Property Spreadsheet</h1>
            <p className="text-gray-600">
              Upload, manage and export your property data in a spreadsheet format.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <button
              onClick={() => setShowImportModal(true)}
              className="bg-primary-500 text-white px-4 py-2 rounded flex items-center hover:bg-primary-600 transition-colors"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded flex items-center hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
            <button
              onClick={handleDownloadTemplate}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded flex items-center hover:bg-gray-50 transition-colors"
            >
              <File className="h-4 w-4 mr-2" />
              Template
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
            <Check className="h-5 w-5 text-green-400 mr-2 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-600">Address</th>
                <th className="px-4 py-3 font-medium text-gray-600">City</th>
                <th className="px-4 py-3 font-medium text-gray-600">State</th>
                <th className="px-4 py-3 font-medium text-gray-600">Price</th>
                <th className="px-4 py-3 font-medium text-gray-600">Beds/Baths</th>
                <th className="px-4 py-3 font-medium text-gray-600">Sqft</th>
                <th className="px-4 py-3 font-medium text-gray-600">Cap Rate</th>
                <th className="px-4 py-3 font-medium text-gray-600">Cash Flow</th>
                <th className="px-4 py-3 font-medium text-gray-600">CoC Return</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    Loading properties...
                  </td>
                </tr>
              ) : properties.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    No properties found. Import some properties to get started.
                  </td>
                </tr>
              ) : (
                properties.map((property, index) => (
                  <tr
                    key={property.id || index}
                    className={`hover:bg-gray-50 border-t border-gray-100 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">{property.address}</td>
                    <td className="px-4 py-3 text-gray-600">{property.city}</td>
                    <td className="px-4 py-3 text-gray-600">{property.state}</td>
                    <td className="px-4 py-3 text-gray-800">
                      ${property.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{property.bedrooms}/{property.bathrooms}</td>
                    <td className="px-4 py-3 text-gray-600">{property.sqft.toLocaleString()}</td>
                    <td className="px-4 py-3 text-blue-600 font-medium">{property.caprate}%</td>
                    <td className="px-4 py-3 text-green-600 font-medium">
                      ${property.cashflow}/mo
                    </td>
                    <td className="px-4 py-3 text-blue-600 font-medium">{property.cocreturn}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Import Properties</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-4 text-gray-600">
              Upload a CSV file containing property data. The file should include headers for address, city, state, etc.
            </p>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
            </div>

            {file && (
              <p className="text-sm text-gray-600 mb-4">
                Selected file: {file.name}
              </p>
            )}

            <div className="flex justify-between">
              <button
                onClick={handleDownloadTemplate}
                className="text-primary-600 hover:text-primary-800"
              >
                Download Template
              </button>
              <div className="space-x-2">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={!file || isLoading}
                  className={`px-4 py-2 rounded text-white ${
                    !file || isLoading
                      ? 'bg-primary-300 cursor-not-allowed'
                      : 'bg-primary-500 hover:bg-primary-600'
                  }`}
                >
                  {isLoading ? 'Importing...' : 'Import'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertySheet;
