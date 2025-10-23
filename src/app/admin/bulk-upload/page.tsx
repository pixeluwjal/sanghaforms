// app/admin/bulk-upload/page.tsx
import { BulkUploadComponent } from "@/components/bulkupload/BulkUploadComponent";

export default function BulkUploadPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Bulk Upload Management</h1>
          <p className="text-gray-600 mt-2">
            Upload files to import data into FormResponse or LeadResponse collections
          </p>
        </div>
        <BulkUploadComponent />
      </div>
    </div>
  );
}