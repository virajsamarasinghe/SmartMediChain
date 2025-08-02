import React, { useEffect, useState } from 'react';

const withPageAnimation = (WrappedComponent) => {
    return function AnimatedPage(props) {
        const [isVisible, setIsVisible] = useState(false);

        useEffect(() => {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 100);

            return () => clearTimeout(timer);
        }, []);

        return (
            <div 
                className={`transition-all duration-500 ease-out transform ${
                    isVisible 
                        ? 'opacity-100 translate-y-0 scale-100' 
                        : 'opacity-0 translate-y-4 scale-95'
                }`}
            >
                <WrappedComponent {...props} />
            </div>
        );
    };
};

export default withPageAnimation;
