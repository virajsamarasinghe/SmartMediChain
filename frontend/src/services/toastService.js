import { toast as reactToast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Toast configuration
const defaultOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true
};

// Toast service methods
const toast = {
  success: (message) => {
    console.log('SUCCESS: ' + message);
    reactToast.success(message, defaultOptions);
  },
  
  error: (message) => {
    console.error('ERROR: ' + message);
    reactToast.error(message, defaultOptions);
  },
  
  info: (message) => {
    console.info('INFO: ' + message);
    reactToast.info(message, defaultOptions);
  },
  
  warning: (message) => {
    console.warn('WARNING: ' + message);
    reactToast.warn(message, defaultOptions);
  }
};

export { toast };
