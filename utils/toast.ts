import toast from 'react-hot-toast';

export const showSuccessToast = (message: string) => {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#4CAF50',
      color: '#fff',
    },
  });
};

export const showErrorToast = (message: string) => {
  toast.error(message, {
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#f44336',
      color: '#fff',
    },
  });
};
