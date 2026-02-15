const generatePassId = async () => {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000); // 4 digit random number
    return `VPS-${year}-${random}`;
};

module.exports = generatePassId;
