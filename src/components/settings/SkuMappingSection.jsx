import { Clipboard, Edit2, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ConfirmDialog, CustomAlert } from "../";
import {
  deleteSkuMapping,
  getAllCategories,
  getAllVerticals,
  getCategoryProducts,
  getVerticalCategories,
  searchSkuMappings,
  setSkuMapping,
  updateSkuMapping,
} from "../../api";
import { useLanguage } from "../../lib/useLanguage";

const MAX_SEARCH_RESULTS = 20;
const DEBOUNCE_DELAY = 1000; // 1 second

export default function SkuMappingSection() {
  const { t } = useLanguage();
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

      // Use server-side search API instead of fetching all
      const results = await searchSkuMappings(term);

      setMappings(results);
      // Limit to MAX_SEARCH_RESULTS
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

  // Generate new SKU based on selections: {vertical}_{category}_{productSkus}_{quantity}{unit}
  const generateNewSku = (formData) => {
    const { verticalName, categoryName, productSkus, quantity, unit } =
      formData;

    // Generate partial or full SKU preview based on what's filled
    if (
      verticalName &&
      categoryName &&
      productSkus.length > 0 &&
      quantity &&
      unit
    ) {
      // Full SKU: all fields filled
      const productsPart = productSkus.join("-");
      const newSku = `${verticalName}_${categoryName}_${productsPart}_${quantity}${unit}`;
      setGeneratedNewSku(newSku);
      setForm((prev) => ({ ...prev, newSku }));
    } else if (
      verticalName &&
      categoryName &&
      productSkus.length > 0 &&
      quantity
    ) {
      // Step 4 completed: waiting for unit
      const productsPart = productSkus.join("-");
      setGeneratedNewSku(
        `${verticalName}_${categoryName}_${productsPart}_${quantity}...`
      );
    } else if (verticalName && categoryName && productSkus.length > 0) {
      // Step 3 completed: waiting for quantity
      const productsPart = productSkus.join("-");
      setGeneratedNewSku(`${verticalName}_${categoryName}_${productsPart}_...`);
    } else if (verticalName && categoryName) {
      // Step 2 completed: waiting for products
      setGeneratedNewSku(`${verticalName}_${categoryName}_..._...`);
    } else if (verticalName) {
      // Step 1 completed: waiting for category
      setGeneratedNewSku(`${verticalName}_..._..._...`);
    } else {
      // Nothing selected yet
      setGeneratedNewSku("..._..._..._...");
    }
  };

  // SKU Builder Functions
  const handleVerticalChange = async (verticalId) => {
    const vertical = verticals.find((v) => v.id === verticalId);
    const updatedForm = {
      verticalId,
      verticalName: vertical?.name || "",
      categoryId: "",
      categoryName: "",
      productSkus: [],
      quantity: "",
      unit: "",
    };
    setNewSkuForm(updatedForm);
    setCategoryProducts([]);
    generateNewSku(updatedForm);

    // Fetch categories for this vertical
    try {
      const categoriesData = await getVerticalCategories(verticalId);
      setCategories(categoriesData || []);

      // Auto-advance to step 2 if vertical is selected
      if (verticalId) {
        setCurrentStep(2);
      }
    } catch (e) {
      console.error("Error fetching categories:", e);
    }
  };

  const handleCategoryChange = async (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    const updatedForm = {
      ...newSkuForm,
      categoryId,
      categoryName: category?.name || "",
      productSkus: [],
      quantity: "",
      unit: "",
    };
    setNewSkuForm(updatedForm);
    generateNewSku(updatedForm);

    // Fetch products for this category
    try {
      const productsData = await getCategoryProducts(categoryId);
      setCategoryProducts(productsData || []);

      // Auto-advance to step 3 if category is selected
      if (categoryId) {
        setCurrentStep(3);
      }
    } catch (e) {
      console.error("Error fetching products:", e);
    }
  };

  const handleAddProductSku = (productSku) => {
    if (productSku && !newSkuForm.productSkus.includes(productSku)) {
      setNewSkuForm((prev) => {
        const updatedForm = {
          ...prev,
          productSkus: [...prev.productSkus, productSku],
        };
        generateNewSku(updatedForm);
        return updatedForm;
      });
    }
  };

  const handleRemoveProductSku = (productSku) => {
    setNewSkuForm((prev) => {
      const updatedForm = {
        ...prev,
        productSkus: prev.productSkus.filter((sku) => sku !== productSku),
      };
      generateNewSku(updatedForm);
      return updatedForm;
    });
  };

  const handleQuantityChange = (quantity) => {
    setNewSkuForm((prev) => {
      const updatedForm = { ...prev, quantity };
      generateNewSku(updatedForm);
      return updatedForm;
    });
  };

  const handleUnitChange = (unit) => {
    setNewSkuForm((prev) => {
      const updatedForm = { ...prev, unit };
      generateNewSku(updatedForm);
      return updatedForm;
    });
  };

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
      unit: "P",
    });
    setGeneratedNewSku("");
    setCurrentStep(1);
    setCategoryProducts([]);
  };

  // TODO: ADD PASTE SYSTEM ANDROID ALSO
  const handlePasteOldSku = async () => {
    try {
      if (window?.isAndroid) {
        const text = await window?.AndroidClipboard.getText();
        setForm((f) => ({ ...f, oldSku: text.trim() }));
      } else {
        const text = await navigator.clipboard.readText();
        setForm((f) => ({ ...f, oldSku: text.trim() }));
      }
    } catch {
      setAlert({ type: "error", message: t("skuMapping.pasteError") });
    }
  };

  const handleAddMapping = async () => {
    // In add mode with builder, use generated SKU
    const newSku = editMapping ? form.newSku : generatedNewSku;
    const oldSku = form.oldSku;

    if (!oldSku.trim() || !newSku.trim()) {
      setAlert({ type: "error", message: t("skuMapping.bothFieldsRequired") });
      return;
    }
    try {
      await setSkuMapping({ oldSku, newSku });
      setAlert({ type: "success", message: t("skuMapping.addSuccess") });
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
      setAlert({ type: "error", message: t("skuMapping.newSkuRequired") });
      return;
    }
    try {
      await updateSkuMapping(editMapping.old_sku, { newSku: form.newSku });
      setAlert({
        type: "success",
        message: t("skuMapping.updateSuccess"),
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
        message: t("skuMapping.deleteSuccess"),
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
            {t("skuMapping.title")}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {hasSearched ? (
              <>
                {filteredMappings.length} {t("skuMapping.resultsFound")}
                {filteredMappings.length >= MAX_SEARCH_RESULTS && (
                  <span className="text-orange-500 dark:text-orange-400 ml-2">
                    ({t("skuMapping.showingFirst")} {MAX_SEARCH_RESULTS})
                  </span>
                )}
              </>
            ) : (
              t("skuMapping.searchPrompt")
            )}
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-200 hover:bg-blue-300 dark:bg-blue-700/40 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-400 rounded-lg transition-colors duration-200"
          onClick={() => {
            setShowModal(true);
            setEditMapping(null);
            setForm({ oldSku: "", newSku: "" });
          }}
        >
          <Plus size={18} /> {t("skuMapping.add")}
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder={t("skuMapping.searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          {t("skuMapping.searching")}
        </div>
      ) : !hasSearched ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
          <p className="text-lg mb-2">{t("skuMapping.searchTitle")}</p>
          <p className="text-sm">{t("skuMapping.searchDescription")}</p>
        </div>
      ) : filteredMappings.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          {t("skuMapping.noResults")}
        </div>
      ) : (
        <div className="space-y-2">
          {/* Header Row */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg font-semibold text-sm text-gray-700 dark:text-gray-300">
            <div className="flex-1">{t("skuMapping.oldSku")}</div>
            <div className="flex-1">{t("skuMapping.newSku")}</div>
            <div className="w-24 text-center">{t("skuMapping.actions")}</div>
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
                    title={t("skuMapping.edit")}
                  >
                    <Edit2
                      size={16}
                      className="text-blue-600 dark:text-blue-400"
                    />
                  </button>
                  <button
                    onClick={() => handleDeleteAction(mapping)}
                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                    title={t("skuMapping.delete")}
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
              {editMapping
                ? t("skuMapping.editTitle")
                : t("skuMapping.addTitle")}
            </h3>

            {/* Edit Mode - Simple Input */}
            {editMapping ? (
              <>
                {/* Old SKU Input (Disabled) */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("skuMapping.oldSku")}
                  </label>
                  <input
                    type="text"
                    placeholder={t("skuMapping.oldSkuPlaceholder")}
                    value={form.oldSku}
                    disabled={true}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {t("skuMapping.oldSkuCannotChange")}
                  </p>
                </div>

                {/* New SKU Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("skuMapping.newSku")}
                  </label>
                  <input
                    type="text"
                    placeholder={t("skuMapping.newSkuPlaceholder")}
                    value={form.newSku}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, newSku: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {t("skuMapping.enterNewSku")}
                  </p>
                </div>
              </>
            ) : (
              /* Add Mode - 5-Step Builder */
              <>
                {/* Old SKU Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("skuMapping.oldSku")}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t("skuMapping.oldSkuPlaceholder")}
                      value={form.oldSku}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, oldSku: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    />
                    <button
                      onClick={handlePasteOldSku}
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      title={t("skuMapping.pasteFromClipboard")}
                    >
                      <Clipboard size={18} />
                    </button>
                  </div>
                </div>

                {/* New SKU Builder */}
                <div className="space-y-4 mb-4">
                  {/* Generated New SKU Display - Always visible at top */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-600/50 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      {t("skuMapping.newSkuPreview")}
                    </p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400 font-mono break-all">
                      {generatedNewSku || "..._..._..._..."}
                    </p>
                  </div>

                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t("skuMapping.buildNewSku")} {currentStep}{" "}
                    {t("skuMapping.of")} 5
                  </h4>

                  {/* Step 1: Select Vertical */}
                  {currentStep === 1 && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t("skuMapping.step1")}
                        </label>
                        <select
                          value={newSkuForm.verticalId}
                          onChange={(e) => {
                            if (e.target.value) {
                              handleVerticalChange(e.target.value);
                            }
                          }}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="">
                            {t("skuMapping.selectVertical")}
                          </option>
                          {verticals.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.label} - {v.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Select Category */}
                  {currentStep === 2 && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t("skuMapping.step2")}
                        </label>
                        <select
                          value={newSkuForm.categoryId}
                          onChange={(e) => {
                            if (e.target.value) {
                              handleCategoryChange(e.target.value);
                            }
                          }}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="">
                            {t("skuMapping.selectCategory")}
                          </option>
                          {categories
                            .filter(
                              (c) => c.vertical_id === newSkuForm.verticalId
                            )
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.label} - {c.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Select Product SKUs */}
                  {currentStep === 3 && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("skuMapping.step3")}
                      </label>

                      {/* Compact selected products display */}
                      {newSkuForm.productSkus.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {newSkuForm.productSkus.map((sku, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-600/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-xs font-mono"
                            >
                              {sku}
                              <button
                                onClick={() => handleRemoveProductSku(sku)}
                                className="hover:text-red-600 dark:hover:text-red-400 font-bold"
                                title="Remove"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Compact dropdown to add product */}
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddProductSku(e.target.value);
                          }
                        }}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">
                          {newSkuForm.productSkus.length > 0
                            ? t("skuMapping.addAnotherProduct")
                            : t("skuMapping.selectProduct")}
                        </option>
                        {categoryProducts
                          .filter(
                            (p) => !newSkuForm.productSkus.includes(p.sku)
                          )
                          .map((p) => (
                            <option key={p.id} value={p.sku}>
                              {p.sku} - {p.name}
                            </option>
                          ))}
                      </select>

                      <div className="flex justify-end mt-2">
                        <button
                          onClick={handleNextStep}
                          disabled={newSkuForm.productSkus.length === 0}
                          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {t("skuMapping.next")}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Enter Quantity */}
                  {currentStep === 4 && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t("skuMapping.step4")}
                        </label>
                        <input
                          type="number"
                          placeholder={t("skuMapping.quantityPlaceholder")}
                          value={newSkuForm.quantity}
                          onChange={(e) => handleQuantityChange(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={handleNextStep}
                          disabled={!newSkuForm.quantity}
                          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {t("skuMapping.next")}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Select Unit */}
                  {currentStep === 5 && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t("skuMapping.step5")}
                        </label>
                        <select
                          value={newSkuForm.unit}
                          onChange={(e) => handleUnitChange(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="">{t("skuMapping.selectUnit")}</option>
                          <option value="P">{t("skuMapping.piece")}</option>
                          <option value="G">{t("skuMapping.gram")}</option>
                          <option value="KG">{t("skuMapping.kilogram")}</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Step Progress Indicators */}
                  <div className="flex items-center justify-center gap-2 pt-2">
                    {[1, 2, 3, 4, 5].map((step) => (
                      <button
                        key={step}
                        onClick={() => handleGoToStep(step)}
                        className={`w-8 h-8 rounded-full text-xs font-bold ${
                          step === currentStep
                            ? "bg-blue-500 dark:bg-blue-500 text-white"
                            : step < currentStep ||
                              (step === 1 && newSkuForm.verticalId) ||
                              (step === 2 && newSkuForm.categoryId) ||
                              (step === 3 &&
                                newSkuForm.productSkus.length > 0) ||
                              (step === 4 && newSkuForm.quantity) ||
                              (step === 5 && newSkuForm.unit)
                            ? "bg-green-600 dark:bg-green-600 text-white cursor-pointer"
                            : "bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                        }`}
                        disabled={
                          !(
                            step <= currentStep ||
                            (step === 1 && newSkuForm.verticalId) ||
                            (step === 2 && newSkuForm.categoryId) ||
                            (step === 3 && newSkuForm.productSkus.length > 0) ||
                            (step === 4 && newSkuForm.quantity) ||
                            (step === 5 && newSkuForm.unit)
                          )
                        }
                      >
                        {step}
                      </button>
                    ))}
                  </div>
                </div>
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
                {t("skuMapping.cancel")}
              </button>
              <button
                onClick={editMapping ? handleEditMapping : handleAddMapping}
                disabled={
                  !editMapping &&
                  (!form.oldSku.trim() || !generatedNewSku.trim())
                }
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 font-medium shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editMapping
                  ? t("skuMapping.updateSku")
                  : t("skuMapping.addSku")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirm.open}
        title={t("skuMapping.deleteTitle")}
        message={t("skuMapping.deleteMessage")}
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
