import React from 'react';

// Reusable component for rendering address input fields
const AddressInputGroup = ({ addressData, sectionName, onChange }) => {
  return (
    <div className="address-block">
      <h4>{sectionName}</h4>
      <div className="form-row">
        <div className="form-field">
          <label>Street</label>
          <input
            type="text"
            name="street"
            value={addressData.street || ''}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-field">
          <label>City</label>
          <input
            type="text"
            name="city"
            value={addressData.city || ''}
            onChange={onChange}
            required
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label>State</label>
          <input
            type="text"
            name="state"
            value={addressData.state || ''}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-field">
          <label>Postal Code</label>
          <input
            type="text"
            name="postal_code" // Keep frontend state name consistent
            value={addressData.postal_code || ''}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-field">
          <label>Country</label>
          <input
            type="text"
            name="country"
            value={addressData.country || ''}
            onChange={onChange}
            required
          />
        </div>
      </div>
    </div>
  );
};

export default AddressInputGroup;
