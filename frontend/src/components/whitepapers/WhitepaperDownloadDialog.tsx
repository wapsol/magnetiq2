import React, { useState } from 'react';
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from '@radix-ui/react-dialog';
import { Download, Mail, Building, User, X, CheckCircle, Loader2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Whitepaper, WhitepaperDownloadRequest } from '../../types/whitepaper';
import { whitepaperService } from '../../services/whitepaper';

interface WhitepaperDownloadDialogProps {
  open: boolean;
  onClose: () => void;
  whitepaper: Whitepaper;
  onSuccess: () => void;
}

const schema = yup.object({
  first_name: yup.string().required('First name is required').min(1).max(100),
  last_name: yup.string().required('Last name is required').min(1).max(100),
  email: yup.string().email('Invalid email format').required('Email is required'),
  company: yup.string().max(255),
  job_title: yup.string().max(255),
  phone: yup.string().max(50)
});

export const WhitepaperDownloadDialog: React.FC<WhitepaperDownloadDialogProps> = ({
  open,
  onClose,
  whitepaper,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<WhitepaperDownloadRequest>({
    resolver: yupResolver(schema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      company: '',
      job_title: '',
      phone: ''
    }
  });

  const handleClose = () => {
    if (!loading) {
      reset();
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  const onSubmit = async (data: WhitepaperDownloadRequest) => {
    try {
      setLoading(true);
      setError(null);

      // Add UTM parameters if available
      const utmParams = whitepaperService.getUtmParameters();
      const requestData = { ...data, ...utmParams };

      const response = await whitepaperService.requestDownload(whitepaper.id, requestData);
      
      // Track download request
      await whitepaperService.trackInteraction(whitepaper.id, 'download_requested', {
        requires_validation: response.validation_required,
        download_id: response.download_id
      });

      setSuccess(true);
      
      // Auto-close after 3 seconds if no validation required
      if (!response.validation_required) {
        setTimeout(() => {
          handleClose();
          onSuccess();
        }, 3000);
      }

    } catch (err: any) {
      console.error('Download request failed:', err);
      setError(err.response?.data?.detail || 'Failed to request download. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const whitepaperTitle = whitepaper.title?.en || whitepaper.title;
  const whitepaperDescription = whitepaper.description?.en || whitepaper.description;

  if (success) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogOverlay className="fixed inset-0 bg-black/50 z-[60]" />
        <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-xl z-[60] p-0 overflow-hidden border border-gray-200 dark:border-gray-700">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 border-green-200 dark:border-green-700">
            <div className="flex items-center space-x-3">
              <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                Check Your Email!
              </DialogTitle>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-green-100 dark:hover:bg-green-800 rounded-full transition-colors text-gray-600 dark:text-gray-300"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex justify-center mb-6">
              <Mail size={64} className="text-green-500 dark:text-green-400" />
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6">
              <p className="text-green-800 dark:text-green-200 text-sm">
                We've sent a confirmation email with your download link. Please check your inbox and click the confirmation link to download your whitepaper.
              </p>
            </div>

            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
              The confirmation link will expire in 24 hours. If you don't see the email, please check your spam folder.
            </p>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {whitepaperTitle}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {whitepaperDescription}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleClose}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogOverlay className="fixed inset-0 bg-black/50 z-[60]" />
      <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-xl z-[60] p-0 overflow-hidden border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900 dark:to-purple-900 border-violet-200 dark:border-violet-700">
          <div className="flex items-center space-x-3">
            <Download size={24} className="text-violet-600 dark:text-violet-400" />
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                Download Whitepaper
              </DialogTitle>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {whitepaperTitle}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-violet-100 dark:hover:bg-violet-800 rounded-full transition-colors text-gray-600 dark:text-gray-300"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Whitepaper Info */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              {whitepaperTitle}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
              {whitepaperDescription}
            </p>
            
            <div className="flex flex-wrap gap-2">
              {whitepaper.category && (
                <span className="px-2 py-1 bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 text-xs rounded border border-violet-200 dark:border-violet-700">
                  {whitepaper.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              )}
              {whitepaper.tags?.slice(0, 3).map((tag) => (
                <span key={tag} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
              <p className="text-red-800 dark:text-red-200 text-sm">
                {error}
              </p>
            </div>
          )}

          {/* Download Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Contact Information */}
            <div>
              <h3 className="flex items-center space-x-2 font-medium text-gray-900 dark:text-white mb-4 text-sm">
                <User size={16} />
                <span>Contact Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Controller
                    name="first_name"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          First Name *
                        </label>
                        <input
                          {...field}
                          type="text"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                            errors.first_name ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter your first name"
                        />
                        {errors.first_name && (
                          <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>
                        )}
                      </div>
                    )}
                  />
                </div>
                
                <div>
                  <Controller
                    name="last_name"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Last Name *
                        </label>
                        <input
                          {...field}
                          type="text"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                            errors.last_name ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter your last name"
                        />
                        {errors.last_name && (
                          <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>
                        )}
                      </div>
                    )}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email Address *
                        </label>
                        <input
                          {...field}
                          type="email"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                            errors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter your email address"
                        />
                        {errors.email && (
                          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="border-t pt-6">
              <h3 className="flex items-center space-x-2 font-medium text-gray-900 dark:text-white mb-4 text-sm">
                <Building size={16} />
                <span>Business Information</span>
                <span className="text-xs text-gray-500">(Optional)</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Controller
                    name="company"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Company
                        </label>
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                          placeholder="Enter your company name"
                        />
                      </div>
                    )}
                  />
                </div>
                
                <div>
                  <Controller
                    name="job_title"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Job Title
                        </label>
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                          placeholder="Enter your job title"
                        />
                      </div>
                    )}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phone Number
                        </label>
                        <input
                          {...field}
                          type="tel"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                By downloading this whitepaper, you agree to receive occasional updates about our research and solutions. You can unsubscribe at any time.
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center space-x-2 min-w-[140px]"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Request Download</span>
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};