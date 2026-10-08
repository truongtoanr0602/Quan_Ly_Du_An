import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import type { InventoryDto, InventoryTransactionDto } from '../../types/admin';

export default function InventoryManagementPage() {
  const [inventory, setInventory] = useState<InventoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Stock Update Modal state
  const [selectedProduct, setSelectedProduct] = useState<InventoryDto | null>(null);
  const [quantityChange, setQuantityChange] = useState<number>(1);
  const [transactionType, setTransactionType] = useState<string>('Import');
  const [stockNote, setStockNote] = useState('');
  const [submittingStock, setSubmittingStock] = useState(false);

  // Transaction History Modal state
  const [historyProduct, setHistoryProduct] = useState<InventoryDto | null>(null);
  const [transactions, setTransactions] = useState<InventoryTransactionDto[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);


  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await adminService.getInventory(search || undefined);
      setInventory(data);
    } catch (err: any) {
      alert('Lỗi tải dữ liệu tồn kho: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [search]);

  const handleOpenUpdateModal = (item: InventoryDto) => {
    setSelectedProduct(item);
    setQuantityChange(1);
    setTransactionType('Import');
    setStockNote('');
  };

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      setSubmittingStock(true);
      await adminService.updateStock(selectedProduct.productId, {
        quantity: quantityChange,
        transactionType,
        note: stockNote,
      });
      alert('Cập nhật tồn kho thành công!');
      setSelectedProduct(null);
      fetchInventory();
    } catch (err: any) {
      alert('Cập nhật thất bại: ' + (err.message || ''));
    } finally {
      setSubmittingStock(false);
    }
  };

  const handleOpenHistory = async (item: InventoryDto) => {
    setHistoryProduct(item);
    try {
      setLoadingHistory(true);
      const hist = await adminService.getTransactions(item.productId);
      setTransactions(hist);
    } catch (err: any) {
      alert('Lỗi tải lịch sử kho: ' + (err.message || ''));
    } finally {
      setLoadingHistory(false);
    }
  };


  const typeBadges: Record<string, string> = {
    IMPORT: 'bg-green-100 text-green-800',
    SALE: 'bg-orange-100 text-orange-800',
    ADJUSTMENT: 'bg-blue-100 text-blue-800',
    RETURN: 'bg-purple-100 text-purple-800',
    CANCEL_ORDER: 'bg-cyan-100 text-cyan-800',
  };
  const typeLabels: Record<string, string> = {
    IMPORT: 'Nhập kho', SALE: 'Xuất kho', ADJUSTMENT: 'Điều chỉnh',
    RETURN: 'Hoàn kho', CANCEL_ORDER: 'Hoàn đơn',
  };

  return (
    <div className="w-full min-h-screen bg-surface">

      <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-on-surface">Quản lý Tồn kho (US-4)</h2>
            <p className="text-sm text-secondary">Theo dõi lượng hàng sẵn có, nhập/xuất kho và kiểm tra lịch sử biến động</p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-sm">search</span>
            <input
              type="text"
              placeholder="Tìm theo tên hoặc SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-outline-variant rounded-lg text-sm bg-surface text-on-surface focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-secondary flex items-center justify-center gap-2">
              <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
              Đang tải dữ liệu tồn kho...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container-low text-secondary text-xs uppercase">
                    <th className="p-4">SKU</th>
                    <th className="p-4">Tên sản phẩm</th>
                    <th className="p-4">Danh mục</th>
                    <th className="p-4">Thương hiệu</th>
                    <th className="p-4 text-center">Số lượng tồn kho</th>
                    <th className="p-4 text-center">Trạng thái</th>
                    <th className="p-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {inventory.map((item) => (
                    <tr key={item.productId} className="hover:bg-surface-container-low/50">
                      <td className="p-4 font-mono font-medium text-secondary">{item.sku}</td>
                      <td className="p-4 font-semibold text-on-surface">{item.productName}</td>
                      <td className="p-4 text-secondary">{item.categoryName}</td>
                      <td className="p-4 text-secondary">{item.brandName}</td>
                      <td className="p-4 text-center font-bold text-base">
                        {item.stockQuantity <= 10 ? (
                          <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                            <span className="material-symbols-outlined text-xs">warning</span>
                            {item.stockQuantity} (Sắp hết)
                          </span>
                        ) : (
                          <span className="text-on-surface">{item.stockQuantity}</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                          {item.isActive ? 'Kinh doanh' : 'Tạm ẩn'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenUpdateModal(item)}
                            className="px-2.5 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded text-xs font-medium transition-colors"
                          >
                            Cập nhật kho
                          </button>
                          <button
                            onClick={() => handleOpenHistory(item)}
                            className="px-2.5 py-1.5 bg-surface-container hover:bg-surface-container-high text-secondary rounded text-xs font-medium transition-colors"
                          >
                            Lịch sử
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {inventory.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-secondary">Không tìm thấy sản phẩm nào</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Update Stock Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-outline-variant pb-3">
                <h3 className="text-base font-bold text-on-surface">Cập nhật kho: {selectedProduct.productName}</h3>
                <button onClick={() => setSelectedProduct(null)} className="text-secondary hover:text-on-surface">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleStockSubmit} className="space-y-4">
                <div className="bg-surface-container-low p-3 rounded-lg text-sm">
                  <span className="text-secondary text-xs block">Tồn kho hiện tại</span>
                  <span className="text-lg font-bold text-on-surface">{selectedProduct.stockQuantity} sản phẩm</span>
                </div>

                <div>
                  <label className="text-xs text-secondary font-medium block mb-1">Loại nghiệp vụ</label>
                  <select
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value)}
                    className="w-full border border-outline-variant rounded-lg p-2 text-sm bg-surface text-on-surface"
                  >
                    <option value="Import">Nhập kho (+)</option>
                    <option value="Export">Xuất kho (-)</option>
                    <option value="Adjustment">Cân bằng kho (Thay thế =)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-secondary font-medium block mb-1">Số lượng</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={quantityChange}
                    onChange={(e) => setQuantityChange(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full border border-outline-variant rounded-lg p-2 text-sm bg-surface text-on-surface"
                  />
                </div>

                <div>
                  <label className="text-xs text-secondary font-medium block mb-1">Ghi chú (Lý do nhập/xuất)</label>
                  <textarea
                    rows={2}
                    placeholder="VD: Nhập lô hàng mới từ nhà cung cấp..."
                    value={stockNote}
                    onChange={(e) => setStockNote(e.target.value)}
                    className="w-full border border-outline-variant rounded-lg p-2 text-sm bg-surface text-on-surface"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="px-4 py-2 border border-outline-variant text-sm rounded-lg hover:bg-surface-container-low"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submittingStock}
                    className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    {submittingStock ? 'Đang lưu...' : 'Xác nhận'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transaction History Modal */}
        {historyProduct && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-outline-variant pb-3">
                <div>
                  <h3 className="text-base font-bold text-on-surface">Lịch sử kho: {historyProduct.productName}</h3>
                  <span className="text-xs text-secondary font-mono">SKU: {historyProduct.sku}</span>
                </div>
                <button onClick={() => setHistoryProduct(null)} className="text-secondary hover:text-on-surface">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {loadingHistory ? (
                <div className="p-8 text-center text-secondary">Đang tải lịch sử...</div>
              ) : (
                <div className="divide-y divide-outline-variant text-sm">
                  {transactions.map((tx) => (
                    <div key={tx.transactionId} className="py-3 flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${typeBadges[tx.transactionType] || 'bg-gray-100 text-gray-800'}`}>
                            {typeLabels[tx.transactionType] || tx.transactionType}
                          </span>
                          <span className="text-xs text-secondary">bởi {tx.createdByName || 'Hệ thống'}</span>
                        </div>
                        {tx.note && <p className="text-xs text-secondary italic">"{tx.note}"</p>}
                        <span className="text-xs text-secondary block">{new Date(tx.createdAt).toLocaleString('vi-VN')}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-on-surface">
                          {tx.previousStock} &rarr; <span className="text-primary font-bold">{tx.newStock}</span>
                        </div>
                        <span className="text-xs text-secondary">Biến động: {tx.quantity >= 0 ? `+${tx.quantity}` : tx.quantity}</span>
                      </div>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <div className="py-8 text-center text-secondary">Chưa có giao dịch kho nào được ghi nhận</div>
                  )}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setHistoryProduct(null)}
                  className="px-4 py-2 border border-outline-variant text-sm rounded-lg hover:bg-surface-container-low"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

