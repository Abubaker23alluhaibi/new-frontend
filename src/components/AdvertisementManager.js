import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const AdvertisementManager = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    type: 'announcement',
    target: 'both',
    startDate: '',
    endDate: '',
    priority: 0,
    isFeatured: false
  });

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/advertisements`);
      
      if (response.ok) {
        const data = await response.json();
        setAdvertisements(data);
      } else {
        setError('فشل في جلب الإعلانات');
      }
    } catch (err) {
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const url = editingAd 
        ? `${process.env.REACT_APP_API_URL}/admin/advertisements/${editingAd._id}`
        : `${process.env.REACT_APP_API_URL}/admin/advertisements`;
      
      const method = editingAd ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ تم حفظ الإعلان:', data);
        setSuccess(editingAd ? 'تم تحديث الإعلان بنجاح' : 'تم إضافة الإعلان بنجاح');
        setShowForm(false);
        setEditingAd(null);
        resetForm();
        fetchAdvertisements();
      } else {
        const errorData = await response.json();
        console.error('❌ خطأ في حفظ الإعلان:', errorData);
        setError(errorData.error || 'حدث خطأ أثناء حفظ الإعلان');
      }
    } catch (err) {
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      description: ad.description,
      image: ad.image,
      type: ad.type,
      target: ad.target,
      startDate: new Date(ad.startDate).toISOString().split('T')[0],
      endDate: new Date(ad.endDate).toISOString().split('T')[0],
      priority: ad.priority,
      isFeatured: ad.isFeatured
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.advertisement_confirm_delete'))) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/advertisements/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSuccess(t('admin.advertisement_deleted'));
        fetchAdvertisements();
      } else {
        setError('فشل في حذف الإعلان');
      }
    } catch (err) {
      setError('خطأ في الاتصال بالخادم');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/advertisements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setSuccess(`تم تغيير حالة الإعلان إلى ${newStatus === 'active' ? 'نشط' : 'غير نشط'}`);
        fetchAdvertisements();
      } else {
        setError('فشل في تغيير حالة الإعلان');
      }
    } catch (err) {
      setError('خطأ في الاتصال بالخادم');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image: '',
      type: 'announcement',
      target: 'both',
      startDate: '',
      endDate: '',
      priority: 0,
      isFeatured: false
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/upload-profile-image`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, image: data.imageUrl }));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'خطأ في رفع الصورة');
      }
    } catch (err) {
      setError('خطأ في الاتصال بالخادم');
    }
  };

  const getTypeLabel = (type) => {
    const types = {
      update: t('admin.advertisement_update'),
      promotion: t('admin.advertisement_promotion'),
      announcement: t('admin.advertisement_announcement'),
      doctor: t('admin.advertisement_doctor'),
      center: t('admin.advertisement_center')
    };
    return types[type] || type;
  };

  const getTargetLabel = (target) => {
    const targets = {
      users: t('admin.target_users'),
      doctors: t('admin.target_doctors'),
      both: t('admin.target_both')
    };
    return targets[target] || target;
  };

  const getStatusLabel = (status) => {
    const statuses = {
      active: t('admin.advertisement_active'),
      inactive: t('admin.advertisement_inactive'),
      pending: t('admin.advertisement_pending')
    };
    return statuses[status] || status;
  };

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>{t('admin.manage_advertisements')}</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingAd(null);
            resetForm();
          }}
          style={{
            background: '#4caf50',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          + {t('admin.add_advertisement')}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '1rem',
          background: '#ffebee',
          color: '#c62828',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: '1rem',
          background: '#e8f5e8',
          color: '#2e7d32',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          {success}
        </div>
      )}

      {/* نموذج إضافة/تعديل الإعلان */}
      {showForm && (
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '1.5rem' }}>
            {editingAd ? t('admin.edit_advertisement') : t('admin.add_advertisement')}
          </h3>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  {t('admin.advertisement_title')} *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  {t('admin.advertisement_type')}
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                >
                  <option value="announcement">{t('admin.advertisement_announcement')}</option>
                  <option value="update">{t('admin.advertisement_update')}</option>
                  <option value="promotion">{t('admin.advertisement_promotion')}</option>
                  <option value="doctor">{t('admin.advertisement_doctor')}</option>
                  <option value="center">{t('admin.advertisement_center')}</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                {t('admin.advertisement_description')} *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows="3"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  {t('admin.advertisement_target')} *
                </label>
                <select
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                >
                  <option value="both">{t('admin.target_both')}</option>
                  <option value="users">{t('admin.target_users')}</option>
                  <option value="doctors">{t('admin.target_doctors')}</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  {t('admin.advertisement_priority')}
                </label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  min="0"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  {t('admin.advertisement_start_date')} *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  {t('admin.advertisement_end_date')} *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                {t('admin.advertisement_image')} *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
              <small style={{ color: '#666', marginTop: '0.5rem', display: 'block' }}>
                {t('admin.advertisement_image_help')}
              </small>
              
              {formData.image && (
                <div style={{ marginTop: '1rem' }}>
                  <img
                    src={formData.image}
                    alt="Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      borderRadius: '8px',
                      border: '1px solid #ddd'
                    }}
                  />
                </div>
              )}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                />
                {t('admin.advertisement_featured')}
              </label>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingAd(null);
                  resetForm();
                }}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                {t('admin.cancel')}
              </button>
              <button
                type="submit"
                disabled={loading || !formData.image}
                style={{
                  background: loading || !formData.image ? '#ccc' : '#2196f3',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: loading || !formData.image ? 'not-allowed' : 'pointer',
                  fontSize: '1rem'
                }}
              >
                {loading ? 'جاري الحفظ...' : t('admin.advertisement_save')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* قائمة الإعلانات */}
      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e0e0e0' }}>
          <h3 style={{ margin: 0, color: '#333' }}>قائمة الإعلانات ({advertisements.length})</h3>
        </div>
        
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>جاري التحميل...</div>
        ) : advertisements.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>لا توجد إعلانات</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f5f5f5' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid #e0e0e0' }}>الصورة</th>
                  <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid #e0e0e0' }}>العنوان</th>
                  <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid #e0e0e0' }}>النوع</th>
                  <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid #e0e0e0' }}>الفئة المستهدفة</th>
                  <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid #e0e0e0' }}>الحالة</th>
                  <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid #e0e0e0' }}>الأولوية</th>
                  <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid #e0e0e0' }}>التواريخ</th>
                  <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid #e0e0e0' }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {advertisements.map(ad => (
                  <tr key={ad._id}>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e0e0e0' }}>
                      <img
                        src={ad.image}
                        alt={ad.title}
                        style={{
                          width: '80px',
                          height: '50px',
                          objectFit: 'cover',
                          borderRadius: '6px'
                        }}
                      />
                    </td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e0e0e0' }}>
                      <div>
                        <strong>{ad.title}</strong>
                        {ad.isFeatured && <span style={{ color: '#9c27b0', marginLeft: '0.5rem' }}>⭐</span>}
                      </div>
                      <small style={{ color: '#666' }}>{ad.description}</small>
                    </td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e0e0e0' }}>
                      {getTypeLabel(ad.type)}
                    </td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e0e0e0' }}>
                      {getTargetLabel(ad.target)}
                    </td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e0e0e0' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <span style={{
                          background: ad.status === 'active' ? '#4caf50' : ad.status === 'pending' ? '#ff9800' : '#e53935',
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.875rem'
                        }}>
                          {getStatusLabel(ad.status)}
                        </span>
                        {ad.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(ad._id, 'active')}
                            style={{
                              background: '#4caf50',
                              color: 'white',
                              border: 'none',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            تفعيل
                          </button>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e0e0e0' }}>
                      {ad.priority}
                    </td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e0e0e0' }}>
                      <div style={{ fontSize: '0.875rem' }}>
                        <div>من: {new Date(ad.startDate).toLocaleDateString('ar-EG')}</div>
                        <div>إلى: {new Date(ad.endDate).toLocaleDateString('ar-EG')}</div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e0e0e0' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleEdit(ad)}
                          style={{
                            background: '#2196f3',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(ad._id)}
                          style={{
                            background: '#e53935',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvertisementManager;