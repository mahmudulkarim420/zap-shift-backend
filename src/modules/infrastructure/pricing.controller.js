const calculatePrice = async (req, res, next) => {
  try {
    const { parcelType, destination, weight } = req.body;

    if (!parcelType || !destination || !weight) {
      return res.status(400).json({
        success: false,
        message: 'parcelType, destination, and weight are required.',
      });
    }

    const kg = parseFloat(weight);
    if (isNaN(kg) || kg <= 0) {
      return res.status(400).json({ success: false, message: 'Weight must be a positive number.' });
    }

    // Base fare by parcel type
    const baseFareMap = {
      document:        50,
      'small-package': 80,
      'medium-package': 120,
      'large-package': 180,
    };
    const baseFare = baseFareMap[parcelType];
    if (!baseFare) {
      return res.status(400).json({ success: false, message: `Unknown parcel type: ${parcelType}` });
    }

    // Destination surcharge
    const destinationChargeMap = {
      'inside-city':  0,
      'outside-city': 50,
      'suburban':     80,
    };
    const destinationCharge = destinationChargeMap[destination];
    if (destinationCharge === undefined) {
      return res.status(400).json({ success: false, message: `Unknown destination: ${destination}` });
    }

    // Weight charge: first 1 KG free, then 20 TK per extra KG
    const extraKg = Math.max(0, kg - 1);
    const weightCharge = Math.ceil(extraKg) * 20;

    const totalCost = baseFare + destinationCharge + weightCharge;

    // Estimated delivery window
    const deliveryWindowMap = {
      'inside-city':  '1 Day',
      'outside-city': '2-3 Days',
      'suburban':     '3-4 Days',
    };

    res.status(200).json({
      success: true,
      data: {
        baseFare,
        weightCharge,
        destinationCharge,
        totalCost,
        estimatedDays: deliveryWindowMap[destination],
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { calculatePrice };
