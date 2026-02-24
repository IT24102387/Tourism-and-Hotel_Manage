import PackageModel from "../models/package";

export const getAllPackages = async (req, res) => {
  try {
    const { type } = req.query; // optional filter: ?type=default or ?type=customised

    const filter = { isActive: true };
    if (type && ["default", "customised"].includes(type)) {
      filter.packageType = type;
    }

    const packages = await PackageModel.find(filter)
      .select("-createdBy -__v")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: packages.length,
      packages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
//  @desc    Get single package by ID (public)
//  @route   GET /api/packages/:id
//  @access  Public
// ─────────────────────────────────────────────
exports.getPackageById = async (req, res) => {
  try {
    const package_ = await Package.findOne({
      _id: req.params.id,
      isActive: true,
    }).select("-__v");

    if (!package_) {
      return res.status(404).json({
        success: false,
        message: "Package not found.",
      });
    }

    res.status(200).json({ success: true, package: package_ });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
//  @desc    Create a new package
//  @route   POST /api/packages
//  @access  Private - Admin only
// ─────────────────────────────────────────────
exports.createPackage = async (req, res) => {
  try {
    const {
      name,
      description,
      packageType,
      price,
      duration,
      inclusions,
      customOptions,
      imageUrl,
    } = req.body;

    // Validate: customised package must include customOptions
    if (packageType === "customised" && !customOptions) {
      return res.status(400).json({
        success: false,
        message:
          "Customised packages must include customOptions (routes, vehicles, extra charges).",
      });
    }

    const newPackage = await Package.create({
      name,
      description,
      packageType,
      price,
      duration,
      inclusions,
      customOptions: packageType === "customised" ? customOptions : null,
      imageUrl,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Package created successfully.",
      package: newPackage,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
//  @desc    Update a package
//  @route   PUT /api/packages/:id
//  @access  Private - Admin only
// ─────────────────────────────────────────────
exports.updatePackage = async (req, res) => {
  try {
    const package_ = await Package.findById(req.params.id);

    if (!package_) {
      return res.status(404).json({
        success: false,
        message: "Package not found.",
      });
    }

    const {
      name,
      description,
      packageType,
      price,
      duration,
      inclusions,
      customOptions,
      imageUrl,
      isActive,
    } = req.body;

    // If changing to customised, require customOptions
    const resolvedType = packageType || package_.packageType;
    if (resolvedType === "customised" && customOptions === null) {
      return res.status(400).json({
        success: false,
        message: "Customised packages must have customOptions defined.",
      });
    }

    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        packageType,
        price,
        duration,
        inclusions,
        customOptions: resolvedType === "customised" ? customOptions : null,
        imageUrl,
        isActive,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Package updated successfully.",
      package: updatedPackage,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
//  @desc    Delete a package (soft delete - sets isActive to false)
//  @route   DELETE /api/packages/:id
//  @access  Private - Admin only
// ─────────────────────────────────────────────
exports.deletePackage = async (req, res) => {
  try {
    const package_ = await Package.findById(req.params.id);

    if (!package_) {
      return res.status(404).json({
        success: false,
        message: "Package not found.",
      });
    }

    // Soft delete: deactivate instead of removing from DB
    // This preserves historical booking data integrity
    await Package.findByIdAndUpdate(req.params.id, { isActive: false });

    res.status(200).json({
      success: true,
      message: "Package removed successfully.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
//  @desc    Get ALL packages including inactive (admin dashboard)
//  @route   GET /api/packages/admin/all
//  @access  Private - Admin only
// ─────────────────────────────────────────────
exports.getAllPackagesAdmin = async (req, res) => {
  try {
    const packages = await Package.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: packages.length,
      packages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


