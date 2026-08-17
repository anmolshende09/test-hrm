import React, { useCallback, useEffect, useState } from "react";
import {
  Briefcase,
  Eye,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import Button from "../components/common/Button";
import ConfirmDialog from "../components/common/ConfirmDialog";
import EmptyState from "../components/common/EmptyState";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Modal from "../components/common/Modal";
import Pagination from "../components/common/Pagination";
import SearchBar from "../components/common/SearchBar";
import { TextField } from "../components/common/FormField";
import StatusBadge from "../components/common/StatusBadge";
import Table from "../components/common/Table";

import { currencyService } from "../services/currencyService";

const EMPTY_FORM = {
  name: "",
  code: "",
  symbol: "",
  isDefault: false,
};

export default function Currencies() {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 1,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [viewCurrency, setViewCurrency] = useState(null);

  const [deleteCurrency, setDeleteCurrency] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadCurrencies = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await currencyService.list({
        search: search || undefined,
        page,
        limit: 50,
      });

      const result = response.data;

      setCurrencies(result.data || []);

      setPagination(
        result.pagination || {
          total: result.data?.length || 0,
          page,
          limit: 50,
          totalPages: 1,
        }
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load currencies."
      );
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    loadCurrencies();
  }, [loadCurrencies]);

  const openCreateModal = () => {
    setEditingCurrency(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (currency) => {
    setEditingCurrency(currency);
    setForm({
      name: currency.name || "",
      code: currency.code || "",
      symbol: currency.symbol || "",
      isDefault: Boolean(currency.isDefault),
    });
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingCurrency(null);
    setForm(EMPTY_FORM);
    setFormError("");
  };

  const handleFormChange = (field) => (event) => {
    const value =
      field === "isDefault"
        ? event.target.checked
        : event.target.value;

    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setFormError("Currency name is required.");
      return;
    }

    if (!form.code.trim()) {
      setFormError("Currency code is required.");
      return;
    }

    if (form.code.trim().length !== 3) {
      setFormError("Currency code must be exactly 3 characters.");
      return;
    }

    if (!form.symbol.trim()) {
      setFormError("Currency symbol is required.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      const payload = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        symbol: form.symbol.trim(),
        isDefault: Boolean(form.isDefault),
      };

      if (editingCurrency) {
        await currencyService.update(
          editingCurrency._id,
          payload
        );
      } else {
        await currencyService.create(payload);
      }

      closeModal();
      await loadCurrencies();
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0]?.msg ||
          "Failed to save currency."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCurrency) return;

    try {
      setDeleting(true);

      await currencyService.remove(deleteCurrency._id);

      setDeleteCurrency(null);
      await loadCurrencies();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete currency."
      );
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "number",
      header: "#",
      render: (_, index) => index + 1,
    },
    {
      key: "name",
      header: "Name",
      render: (row) => (
        <div>
          <p className="font-medium text-ink">{row.name}</p>
        </div>
      ),
    },
    {
      key: "code",
      header: "Code",
      render: (row) => (
        <span className="font-medium">{row.code}</span>
      ),
    },
    {
      key: "symbol",
      header: "Symbol",
      render: (row) => (
        <span className="text-body">{row.symbol}</span>
      ),
    },
    {
      key: "isDefault",
      header: "Default",
      render: (row) =>
        row.isDefault ? (
          <StatusBadge status="approved" />
        ) : (
          <span className="text-caption text-ink-muted48">—</span>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="View currency"
            onClick={() => setViewCurrency(row)}
            className="press-active w-8 h-8 rounded-full flex items-center justify-center text-ink-muted48 hover:bg-canvas-parchment hover:text-ink"
          >
            <Eye size={16} />
          </button>

          <button
            type="button"
            title="Edit currency"
            onClick={() => openEditModal(row)}
            className="press-active w-8 h-8 rounded-full flex items-center justify-center text-ink-muted48 hover:bg-canvas-parchment hover:text-ink"
          >
            <Pencil size={16} />
          </button>

          <button
            type="button"
            title="Delete currency"
            onClick={() => setDeleteCurrency(row)}
            className="press-active w-8 h-8 rounded-full flex items-center justify-center text-danger hover:bg-danger-soft"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-display-sm">Currencies</h1>
          <p className="text-body text-ink-muted48 mt-1">
            Manage currencies used throughout the HRMS.
          </p>
        </div>

        <Button
          icon={Plus}
          onClick={openCreateModal}
        >
          Add Currency
        </Button>
      </div>

      {/* Search */}
      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        <SearchBar
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search currencies..."
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-danger-soft border border-danger/20 rounded-lg px-4 py-3 text-caption text-danger">
          {error}
        </div>
      )}

      {/* Currency Table */}
      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        <Table
          columns={columns}
          data={currencies}
          loading={loading}
          emptyTitle="No currencies found"
          emptyDescription={
            search
              ? "Try adjusting your search."
              : "Add your first currency to get started."
          }
        />

        {!loading && currencies.length > 0 && (
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onChange={setPage}
          />
        )}
      </div>

      {/* Add/Edit Currency Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={
          editingCurrency
            ? "Edit Currency"
            : "Add New Currency"
        }
        width="max-w-lg"
      >
        <form onSubmit={handleSave} className="space-y-5">
          {formError && (
            <div className="bg-danger-soft border border-danger/20 rounded-sm px-3 py-2 text-caption text-danger">
              {formError}
            </div>
          )}

          <TextField
            label="Name"
            required
            value={form.name}
            onChange={handleFormChange("name")}
            placeholder="e.g. Indian Rupee"
          />

          <TextField
            label="Code"
            required
            value={form.code}
            onChange={handleFormChange("code")}
            placeholder="e.g. INR"
            maxLength={3}
          />

          <TextField
            label="Symbol"
            required
            value={form.symbol}
            onChange={handleFormChange("symbol")}
            placeholder="e.g. ₹"
          />

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={handleFormChange("isDefault")}
              className="w-4 h-4 rounded-xs border-hairline text-primary focus:ring-primary-focus"
            />
            <span className="text-caption-strong text-ink-muted80">
              Set as default currency
            </span>
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t border-hairline">
            <Button
              type="button"
              variant="ghost"
              onClick={closeModal}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              loading={saving}
            >
              {editingCurrency ? "Update Currency" : "Save Currency"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Currency Modal */}
      <Modal
        open={Boolean(viewCurrency)}
        onClose={() => setViewCurrency(null)}
        title="Currency Details"
        width="max-w-md"
      >
        {viewCurrency && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-4">
              <div>
                <p className="text-caption text-ink-muted48">
                  Currency
                </p>
                <p className="text-tagline mt-1">
                  {viewCurrency.name}
                </p>
              </div>

              <div className="w-12 h-12 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xl font-semibold">
                {viewCurrency.symbol}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-caption text-ink-muted48">
                  Code
                </p>
                <p className="text-body-strong mt-1">
                  {viewCurrency.code}
                </p>
              </div>

              <div>
                <p className="text-caption text-ink-muted48">
                  Symbol
                </p>
                <p className="text-body-strong mt-1">
                  {viewCurrency.symbol}
                </p>
              </div>

              <div>
                <p className="text-caption text-ink-muted48">
                  Default
                </p>
                <div className="mt-1">
                  {viewCurrency.isDefault ? (
                    <StatusBadge status="approved" />
                  ) : (
                    <span className="text-caption text-ink-muted48">
                      No
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteCurrency)}
        onClose={() => {
          if (!deleting) setDeleteCurrency(null);
        }}
        onConfirm={handleDelete}
        title="Delete Currency?"
        description={
          deleteCurrency
            ? `Are you sure you want to delete "${deleteCurrency.name}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        loading={deleting}
        danger
      />
    </div>
  );
}