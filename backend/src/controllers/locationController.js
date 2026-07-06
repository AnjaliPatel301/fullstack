exports.checkPincode = async (req, res) => {
  const { pincode } = req.params;
  const validPincodes = {
    '110001': { city: 'New Delhi', state: 'Delhi', deliveryDays: 2 },
    '400001': { city: 'Mumbai', state: 'Maharashtra', deliveryDays: 3 },
    '560001': { city: 'Bangalore', state: 'Karnataka', deliveryDays: 3 },
    '600001': { city: 'Chennai', state: 'Tamil Nadu', deliveryDays: 4 },
    '700001': { city: 'Kolkata', state: 'West Bengal', deliveryDays: 4 },
    '500001': { city: 'Hyderabad', state: 'Telangana', deliveryDays: 3 },
    '411001': { city: 'Pune', state: 'Maharashtra', deliveryDays: 3 },
    '380001': { city: 'Ahmedabad', state: 'Gujarat', deliveryDays: 3 },
    '302001': { city: 'Jaipur', state: 'Rajasthan', deliveryDays: 4 },
    '226001': { city: 'Lucknow', state: 'Uttar Pradesh', deliveryDays: 4 },
  };

  if (pincode.length !== 6 || !/^\d+$/.test(pincode))
    return res.status(400).json({ success: false, message: 'Invalid pincode format' });

  const locationData = validPincodes[pincode];
  if (locationData) {
    res.json({
      success: true,
      serviceable: true,
      city: locationData.city,
      state: locationData.state,
      deliveryDays: locationData.deliveryDays,
      message: `Delivery available in ${locationData.deliveryDays}-${locationData.deliveryDays + 1} business days`,
    });
  } else {
    res.json({
      success: true,
      serviceable: true,
      city: 'Your City',
      state: 'Your State',
      deliveryDays: 7,
      message: 'Standard delivery in 5-7 business days',
    });
  }
};
