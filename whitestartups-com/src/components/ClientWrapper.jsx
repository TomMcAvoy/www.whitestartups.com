'use client'; // Ensure this directive is correctly formatted
import React from 'react';
import dynamic from 'next/dynamic';
const ClientGraphics = dynamic(() => import('@/components/ClientGraphics'), {
    ssr: false, // Disable server-side rendering
});
const ClientWrapper = ({ initialStars, initialShootingStars, children, }) => {
    return (<>
      {children}
      <ClientGraphics initialStars={initialStars} initialShootingStars={initialShootingStars}/>
    </>);
};
export default ClientWrapper;
//# sourceMappingURL=ClientWrapper.jsx.map