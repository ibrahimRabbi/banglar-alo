import React, { Suspense } from 'react';
import SignIn from './_components/SignIn';
 

const page = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SignIn />
        </Suspense>
    );
};

export default page;