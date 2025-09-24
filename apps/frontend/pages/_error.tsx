import React from 'react';

function ErrorPage() {
  return (
    <div style={{padding:40,fontFamily:'sans-serif'}}>
      <h1>Application Error</h1>
      <p>An unexpected error occurred.</p>
      <a href="/">Return Home</a>
    </div>
  );
}

ErrorPage.getInitialProps = () => ({}) as any;
export default ErrorPage;
