import { useSearchParams } from 'next/navigation';
import React from 'react';

const page = () => {
    const query = useSearchParams()
    const id = query.get('id')
    
    return (
        <div>
            hi
        </div>
    );
};

export default page;