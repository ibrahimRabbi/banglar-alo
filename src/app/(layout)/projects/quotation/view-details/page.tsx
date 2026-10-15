 
import Link from 'next/link';
import React from 'react';

const page = () => {
    return (
        <div>
            
            <Link
                href="/projects/create"
                className=" text-stone-800 font-medium"
            >
                + New project
            </Link>
        </div>
    );
};

export default page;