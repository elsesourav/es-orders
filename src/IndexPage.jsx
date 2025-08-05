function IndexPage() {

   const renderContent = () => {
      return <h1>
         Options Page Content
      </h1>
   };

   return (
      <div className="min-h-screen bg-dark-dotted pl-22">
         <main className="max-w-5xl mx-auto px-4 py-8 custom-scrollbar overflow-y-auto max-h-screen">{renderContent()}</main>
      </div>
   );
}

export default IndexPage;
