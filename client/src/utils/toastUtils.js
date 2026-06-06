import toast from 'react-hot-toast';

export const useToast = {
  success: (message) => {
    toast.success(message, {
      style: {
        background: '#0f0f0f',
        color: '#fff',
        border: '1px solid #262626',
        fontSize: '12px',
        borderRadius: '8px',
      },
      iconTheme: {
        primary: '#00d2ff',
        secondary: '#0a0a0a',
      },
    });
  },
  
  error: (message) => {
    toast.error(message, {
      style: {
        background: '#0f0f0f',
        color: '#fff',
        border: '1px solid #262626',
        fontSize: '12px',
        borderRadius: '8px',
      },
      iconTheme: {
        primary: '#ff4444',
        secondary: '#0a0a0a',
      },
    });
  },

  loading: (message = 'Processing...') => {
    return toast.loading(message, {
      style: {
        background: '#0f0f0f',
        color: '#fff',
        border: '1px solid #262626',
        fontSize: '12px',
        borderRadius: '8px',
      },
    });
  },

  dismiss: (toastId) => {
    toast.dismiss(toastId);
  }
};

// import toast from 'react-hot-toast';

// export const useToast = {
//   success: (message) => {
//     toast.success(message, {
//       style: {
//         background: 'hsl(var(--card))',
//         color: 'hsl(var(--card-foreground))',
//         border: '1px solid hsl(var(--border))',
//         fontSize: '12px',
//         borderRadius: '8px',
//       },
//       iconTheme: { primary: 'hsl(var(--primary))', secondary: 'hsl(var(--background))' },
//     });
//   },
//   error: (message) => {
//     toast.error(message, {
//       style: {
//         background: 'hsl(var(--card))',
//         color: 'hsl(var(--card-foreground))',
//         border: '1px solid hsl(var(--border))',
//         fontSize: '12px',
//         borderRadius: '8px',
//       },
//       iconTheme: { primary: 'hsl(var(--destructive))', secondary: 'hsl(var(--background))' },
//     });
//   },
//   loading: (message = 'Processing...') => {
//     return toast.loading(message, {
//       style: {
//         background: 'hsl(var(--card))',
//         color: 'hsl(var(--card-foreground))',
//         border: '1px solid hsl(var(--border))',
//         fontSize: '12px',
//         borderRadius: '8px',
//       },
//     });
//   },
//   dismiss: (toastId) => toast.dismiss(toastId)
// };