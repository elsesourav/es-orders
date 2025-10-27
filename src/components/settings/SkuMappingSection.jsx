import { ArrowLeft, ArrowRight, Edit2, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ConfirmDialog, CustomAlert } from "../";
import {
  deleteSkuMapping,
  getAllCategories,
  getAllSkuMappings,
  getAllVerticals,
  getCategoryProducts,
  getVerticalCategories,
  setSkuMapping,
  updateSkuMapping,
} from "../../api";

const MAX_SEARCH_RESULTS = 20;
const DEBOUNCE_DELAY = 1000; // 1 second

export default function SkuMappingSection() {
  // eslint-disable-next-line no-unused-vars
  const [mappings, setMappings] = useState([]);
  const [filteredMappings, setFilteredMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMapping, setEditMapping] = useState(null);
  const [form, setForm] = useState({ oldSku: "", newSku: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [confirm, setConfirm] = useState({
    open: false,
    type: null,
    id: null,
    data: null,
  });
  const [alert, setAlert] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceTimerRef = useRef(null);

  // 5-step SKU builder state
  const [verticals, setVerticals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [newSkuForm, setNewSkuForm] = useState({
    verticalId: "",
    verticalName: "",
    categoryId: "",
    categoryName: "",
    productSkus: [],
    quantity: "",
    unit: "",
  });
  const [generatedNewSku, setGeneratedNewSku] = useState("");
  const [currentStep, setCurrentStep] = useState(1);

  // Fetch verticals and categories on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [verticalsData, categoriesData] = await Promise.all([
          getAllVerticals(),
          getAllCategories(),
        ]);
        setVerticals(verticalsData || []);
        setCategories(categoriesData || []);
      } catch (e) {
        console.error("Error fetching verticals/categories:", e);
      }
    };
    fetchData();
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Client-side search with debounce
  const performSearch = useCallback(async (term) => {
    if (!term.trim()) {
      setFilteredMappings([]);
      setMappings([]);
      setHasSearched(false);
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);
      const data = await getAllSkuMappings();

      const searchLower = term.toLowerCase();
      const results = data.filter(
        (mapping) =>
          mapping.old_sku.toLowerCase().includes(searchLower) ||
          mapping.new_sku.toLowerCase().includes(searchLower)
      );

      setMappings(data);
      // Limit to 20 results
      setFilteredMappings(results.slice(0, MAX_SEARCH_RESULTS));
      setLoading(false);
    } catch (e) {
      setAlert({ type: "error", message: e.message });
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredMappings([]);
      setMappings([]);
      setHasSearched(false);
    }
  }, [searchTerm]);

  const handleSearch = (term) => {
    setSearchTerm(term);

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // If empty, clear immediately without debounce
    if (!term.trim()) {
      setFilteredMappings([]);
      setMappings([]);
      setHasSearched(false);
      return;
    }

    // Set new timer for debounce
    debounceTimerRef.current = setTimeout(() => {
      performSearch(term);
    }, DEBOUNCE_DELAY);
  };

  // SKU Builder Functions
  const handleVerticalChange = async (verticalId) => {
    const vertical = verticals.find((v) => v.id === parseInt(verticalId));
    setNewSkuForm((prev) => ({
      ...prev,
      verticalId,
      verticalName: vertical?.name || "",
      categoryId: "",
      categoryName: "",
      productSkus: [],
    }));

    // Fetch categories for this vertical
    try {
      const categoriesData = await getVerticalCategories(verticalId);
      setCategories(categoriesData || []);
    } catch (e) {
      console.error("Error fetching categories:", e);
    }
  };

  const handleCategoryChange = async (categoryId) => {
    const category = categories.find((c) => c.id === parseInt(categoryId));
    setNewSkuForm((prev) => ({
      ...prev,
      categoryId,
      categoryName: category?.name || "",
      productSkus: [],
    }));

    // Fetch products for this category
    try {
      const productsData = await getCategoryProducts(categoryId);
      setCategoryProducts(productsData || []);
    } catch (e) {
      console.error("Error fetching products:", e);
    }
  };

  const handleAddProductSku = (productSku) => {
    if (!newSkuForm.productSkus.includes(productSku)) {
      setNewSkuForm((prev) => ({
        ...prev,
        productSkus: [...prev.productSkus, productSku],
      }));
    }
  };

  const handleRemoveProductSku = (productSku) => {
    setNewSkuForm((prev) => ({
      ...prev,
      productSkus: prev.productSkus.filter((sku) => sku !== productSku),
    }));
  };

  const handleQuantityChange = (quantity) => {
    setNewSkuForm((prev) => ({ ...prev, quantity }));
  };

  const handleUnitChange = (unit) => {
    setNewSkuForm((prev) => ({ ...prev, unit }));
  };

  const generateNewSku = useCallback(() => {
    const { verticalName, categoryName, productSkus, quantity, unit } =
      newSkuForm;

    if (
      !verticalName ||
      !categoryName ||
      productSkus.length === 0 ||
      !quantity ||
      !unit
    ) {
      return "";
    }

    const productsPart = productSkus.join("_");
    const generatedSku = `${verticalName}_${categoryName}_${productsPart}_${quantity}${unit}`;
    return generatedSku;
  }, [newSkuForm]);

  useEffect(() => {
    setGeneratedNewSku(generateNewSku());
  }, [generateNewSku]);

  const handleNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleGoToStep = (step) => {
    setCurrentStep(step);
  };

  const resetBuilder = () => {
    setNewSkuForm({
      verticalId: "",
      verticalName: "",
      categoryId: "",
      categoryName: "",
      productSkus: [],
      quantity: "",
      unit: "",
    });
    setGeneratedNewSku("");
    setCurrentStep(1);
    setCategoryProducts([]);
  };

  const handleAddMapping = async () => {
    // In add mode with builder, use generated SKU
    const newSku = editMapping ? form.newSku : generatedNewSku;
    const oldSku = form.oldSku;

    if (!oldSku.trim() || !newSku.trim()) {
      setAlert({ type: "error", message: "Both fields are required" });
      return;
    }
    try {
      await setSkuMapping({ oldSku, newSku });
      setAlert({ type: "success", message: "SKU mapping added successfully" });
      setShowModal(false);
      setForm({ oldSku: "", newSku: "" });
      resetBuilder();
      // Refresh search results if user has searched
      if (hasSearched && searchTerm) {
        performSearch(searchTerm);
      }
    } catch (e) {
      setAlert({ type: "error", message: e.message });
    }
  };

  const handleEditMapping = async () => {
    if (!form.newSku.trim()) {
      setAlert({ type: "error", message: "New SKU is required" });
      return;
    }
    try {
      await updateSkuMapping(editMapping.old_sku, { newSku: form.newSku });
      setAlert({
        type: "success",
        message: "SKU mapping updated successfully",
      });
      setShowModal(false);
      setEditMapping(null);
      setForm({ oldSku: "", newSku: "" });
      resetBuilder();
      // Refresh search results if user has searched
      if (hasSearched && searchTerm) {
        performSearch(searchTerm);
      }
    } catch (e) {
      setAlert({ type: "error", message: e.message });
    }
  };

  const handleDeleteMapping = async (oldSku) => {
    try {
      await deleteSkuMapping(oldSku);
      setAlert({
        type: "success",
        message: "SKU mapping deleted successfully",
      });
      // Refresh search results if user has searched
      if (hasSearched && searchTerm) {
        performSearch(searchTerm);
      }
    } catch (e) {
      setAlert({ type: "error", message: e.message });
    }
  };

  const handleRowAction = (mapping) => {
    setEditMapping(mapping);
    setForm({ oldSku: mapping.old_sku, newSku: mapping.new_sku });
    setShowModal(true);
  };

  const handleDeleteAction = (mapping) => {
    setConfirm({
      open: true,
      type: "single",
      id: mapping.old_sku,
      data: null,
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {alert && (
        <CustomAlert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            SKU Mappings
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {hasSearched ? (
              <>
                {filteredMappings.length} result(s) found
                {filteredMappings.length >= MAX_SEARCH_RESULTS && (
                  <span className="text-orange-500 dark:text-orange-400 ml-2">
                    (showing first {MAX_SEARCH_RESULTS})
                  </span>
                )}
              </>
            ) : (
              "Start typing to search SKU mappings"
            )}
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transform hover:-translate-y-0.5"
          onClick={() => {
            setShowModal(true);
            setEditMapping(null);
            setForm({ oldSku: "", newSku: "" });
          }}
        >
          <Plus size={18} /> Add
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by Old SKU or New SKU..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          Searching...
        </div>
      ) : !hasSearched ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
          <p className="text-lg mb-2">🔍 Search SKU Mappings</p>
          <p className="text-sm">
            Type in the search box above to find SKU mappings
          </p>
        </div>
      ) : filteredMappings.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          No mappings found matching your search
        </div>
      ) : (
        <div className="space-y-2">
          {/* Header Row */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg font-semibold text-sm text-gray-700 dark:text-gray-300">
            <div className="flex-1">Old SKU</div>
            <div className="flex-1">New SKU</div>
            <div className="w-24 text-center">Actions</div>
          </div>

          {/* Data Rows */}
          <div className="space-y-1 max-h-96 overflow-y-auto custom-scrollbar">
            {filteredMappings.map((mapping, index) => (
              <div
                key={mapping.old_sku}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  index % 2 === 0
                    ? "bg-white dark:bg-gray-900/30"
                    : "bg-gray-50 dark:bg-gray-900/50"
                } hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-transparent hover:border-primary-200 dark:hover:border-primary-800`}
              >
                <div className="flex-1 text-sm text-gray-900 dark:text-gray-100 font-mono truncate">
                  {mapping.old_sku}
                </div>
                <div className="flex-1 text-sm text-gray-700 dark:text-gray-300 font-mono truncate">
                  {mapping.new_sku}
                </div>
                <div className="w-24 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleRowAction(mapping)}
                    className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                    title="Edit Mapping"
                  >
                    <Edit2
                      size={16}
                      className="text-blue-600 dark:text-blue-400"
                    />
                  </button>
                  <button
                    onClick={() => handleDeleteAction(mapping)}
                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                    title="Delete Mapping"
                  >
                    <Trash2
                      size={16}
                      className="text-red-600 dark:text-red-400"
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-8 border border-gray-200 dark:border-gray-700 w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">
              {editMapping ? "Edit SKU Mapping" : "Add SKU Mapping"}
            </h3>

            {/* Edit Mode - Simple Input Fields */}
            {editMapping ? (
              <>
                {/* Old SKU Input (Disabled) */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Old SKU <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., DAHLIA__100__PIECE__3AS7"
                    value={form.oldSku}
                    disabled={true}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 opacity-60 cursor-not-allowed"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Old SKU cannot be changed
                  </p>
                </div>

                {/* New SKU Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New SKU <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., SED_FLW_DL_100P"
                    value={form.newSku}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, newSku: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Enter the new mapped SKU code
                  </p>
                </div>
              </>
            ) : (
              /* Add Mode - 5-Step Builder */
              <>
                {/* Old SKU Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Old SKU <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., DAHLIA__100__PIECE__3AS7"
                    value={form.oldSku}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, oldSku: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Enter the original SKU code to be mapped
                  </p>
                </div>

                {/* Generated New SKU Preview */}
                {generatedNewSku && (
                  <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">
                      Generated New SKU:
                    </div>
                    <div className="text-lg font-mono font-bold text-green-900 dark:text-green-100">
                      {generatedNewSku}
                    </div>
                  </div>
                )}

                {/* Step Progress Indicators */}
                <div className="mb-6 flex items-center justify-between">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div key={step} className="flex items-center">
                      <button
                        onClick={() => handleGoToStep(step)}
                        disabled={
                          (step === 2 && !newSkuForm.verticalId) ||
                          (step === 3 && !newSkuForm.categoryId) ||
                          (step === 4 && newSkuForm.productSkus.length === 0) ||
                          (step === 5 && !newSkuForm.quantity)
                        }
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                          currentStep === step
                            ? "bg-primary-600 text-white shadow-lg scale-110"
                            : step < currentStep ||
                              (step === 2 && newSkuForm.verticalId) ||
                              (step === 3 && newSkuForm.categoryId) ||
                              (step === 4 &&
                                newSkuForm.productSkus.length > 0) ||
                              (step === 5 && newSkuForm.quantity)
                            ? "bg-green-500 text-white hover:bg-green-600 cursor-pointer"
                            : "bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {step}
                      </button>
                      {step < 5 && (
                        <div
                          className={`w-12 h-1 mx-1 ${
                            step < currentStep
                              ? "bg-green-500"
                              : "bg-gray-300 dark:bg-gray-700"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Step 1: Select Vertical */}
                {currentStep === 1 && (
                  <div className="mb-6 space-y-4">
                    <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200">
                      Step 1: Select Vertical
                    </h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Vertical <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newSkuForm.verticalId}
                        onChange={(e) => handleVerticalChange(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Choose a vertical</option>
                        {verticals.map((v) => (
                          <option key={v.id} value={v.id.toString()}>
                            {v.label || v.name}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Select the business vertical for this product
                      </p>
                    </div>
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={handleNextStep}
                        disabled={!newSkuForm.verticalId}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 font-medium shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Select Category */}
                {currentStep === 2 && (
                  <div className="mb-6 space-y-4">
                    <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200">
                      Step 2: Select Category
                    </h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newSkuForm.categoryId}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Choose a category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id.toString()}>
                            {c.label || c.name}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Select a category within {newSkuForm.verticalName}
                      </p>
                    </div>
                    <div className="flex justify-between mt-4">
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors duration-200 font-medium"
                      >
                        <ArrowLeft size={18} /> Back
                      </button>
                      <button
                        onClick={handleNextStep}
                        disabled={!newSkuForm.categoryId}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 font-medium shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Select Product SKUs */}
                {currentStep === 3 && (
                  <div className="mb-6 space-y-4">
                    <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200">
                      Step 3: Select Product SKUs
                    </h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Product SKUs <span className="text-red-500">*</span>
                      </label>
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddProductSku(e.target.value);
                          }
                        }}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Add product SKUs</option>
                        {categoryProducts
                          .filter(
                            (p) => !newSkuForm.productSkus.includes(p.sku)
                          )
                          .map((p) => (
                            <option key={p.sku} value={p.sku}>
                              {p.sku} - {p.name}
                            </option>
                          ))}
                      </select>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Add one or more product SKUs to this mapping
                      </p>
                    </div>

                    {/* Selected Product SKUs */}
                    {newSkuForm.productSkus.length > 0 && (
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Selected SKUs ({newSkuForm.productSkus.length}):
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {newSkuForm.productSkus.map((sku) => (
                            <div
                              key={sku}
                              className="flex items-center gap-2 px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 border border-primary-300 dark:border-primary-700 rounded-lg"
                            >
                              <span className="text-sm font-mono text-primary-800 dark:text-primary-200">
                                {sku}
                              </span>
                              <button
                                onClick={() => handleRemoveProductSku(sku)}
                                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between mt-4">
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors duration-200 font-medium"
                      >
                        <ArrowLeft size={18} /> Back
                      </button>
                      <button
                        onClick={handleNextStep}
                        disabled={newSkuForm.productSkus.length === 0}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 font-medium shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: Enter Quantity */}
                {currentStep === 4 && (
                  <div className="mb-6 space-y-4">
                    <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200">
                      Step 4: Enter Quantity
                    </h4>
                    <NumberInput
                      label="Quantity"
                      placeholder="e.g., 100"
                      value={newSkuForm.quantity}
                      onChange={handleQuantityChange}
                      helperText="Enter the quantity for this product"
                    />
                    <div className="flex justify-between mt-4">
                      <button
                        onClick={() => setCurrentStep(3)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors duration-200 font-medium"
                      >
                        <ArrowLeft size={18} /> Back
                      </button>
                      <button
                        onClick={handleNextStep}
                        disabled={!newSkuForm.quantity}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 font-medium shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 5: Select Unit */}
                {currentStep === 5 && (
                  <div className="mb-6 space-y-4">
                    <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200">
                      Step 5: Select Unit
                    </h4>
                    <SelectInput
                      label="Unit"
                      placeholder="Choose a unit"
                      value={newSkuForm.unit}
                      onChange={handleUnitChange}
                      options={[
                        { value: "P", label: "Piece (P)" },
                        { value: "G", label: "Gram (G)" },
                        { value: "KG", label: "Kilogram (KG)" },
                      ]}
                      helperText="Select the unit of measurement"
                    />
                    <div className="flex justify-between mt-4">
                      <button
                        onClick={() => setCurrentStep(4)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors duration-200 font-medium"
                      >
                        <ArrowLeft size={18} /> Back
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditMapping(null);
                  setForm({ oldSku: "", newSku: "" });
                  resetBuilder();
                }}
                className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={editMapping ? handleEditMapping : handleAddMapping}
                disabled={
                  !editMapping &&
                  (!form.oldSku.trim() || !generatedNewSku.trim())
                }
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 font-medium shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editMapping ? "Update" : "Add"} Mapping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirm.open}
        title="Delete SKU Mapping?"
        message="Are you sure you want to delete this SKU mapping? This action cannot be undone."
        onConfirm={() => {
          handleDeleteMapping(confirm.id);
          setConfirm({ open: false, type: null, id: null, data: null });
        }}
        onCancel={() =>
          setConfirm({ open: false, type: null, id: null, data: null })
        }
      />
    </div>
  );
}
