// Update this page (the content is just a fallback if you fail to update the page)

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with HSBC Logo */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <img 
            src="/uploaded/2cb7125c-8178-444d-9da1-b5b7641913ec.png" 
            alt="HSBC"
            className="h-8 w-auto"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">Welcome to HSBC</h1>
          <p className="text-xl text-gray-600">Your secure banking experience starts here!</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black text-white py-6">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="text-sm space-y-2">
            <div className="flex items-center justify-center space-x-4">
              <span>Investor relations</span>
              <span>|</span>
              <span>HSBC Group</span>
              <span>|</span>
              <span>© HSBC Bank Malta p.l.c. 2025. All rights reserved.</span>
            </div>
            <div>
              <span>This website is designed for use in Malta. Cross-border banking</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
