enum COLORS{
    PRIMARY = '#F69248',
    PRIMARY_TEXT = '#1E293B',
    HIGHLIGHT = '#475569',
    BORDER = '#E2E8F0',
    BLUE = '#3C9AFB',
    WHITE = '#fff',
    BLACK = '#000',
    RED = '#D12E34',
    PLACEHOLDER = '#64748B',
    INPUT_PLACEHOLDER = '#94A3B8',
    INPUT_TEXT='#334155',
    SUCCESS = '#5cb85c',
    ERROR = '#d9534f',
    INFO = '#f0ad4e'
}

enum FONT {
    PoppinsRegular = 'Poppins-Regular',
    PoppinsMedium = 'Poppins-Medium',
    PoppinsBold = 'Poppins-Bold',
    PoppinsExtraBold = 'Poppins-ExtraBold',
}

const TEXT_STYLE = {
    regular: {
        fontFamily: FONT.PoppinsRegular,
    },
    medium: {
        fontFamily: FONT.PoppinsMedium,
    },
    bold: {
        fontFamily: FONT.PoppinsBold,
    },
    extraBold: {
        fontFamily: FONT.PoppinsExtraBold,
    },
};

const FONT_SIZE = {
    h1: 20,
    h2: 18,
    h3: 16,
    h4: 14,
    h5: 12,
    h6: 10,
    headerSize: 30,
    customSize: 32,
    small: 12,
};

export { COLORS,TEXT_STYLE,FONT_SIZE }