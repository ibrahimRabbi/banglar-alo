export interface TrainingCenter {
    id: string;
    name: string;
    division: string;
    district: string;
    subArea: string; // upazila / thana
    address: string;
}

export const trainingCenters: TrainingCenter[] = [
    // =========================
    // DHAKA DIVISION
    // =========================

    {
        id: 'tc-01',
        name: 'Dhaka Central Training Center',
        division: 'Dhaka',
        district: 'Dhaka',
        subArea: 'Mirpur',
        address: 'House 12, Road 5, Mirpur-10, Dhaka',
    },
    {
        id: 'tc-02',
        name: 'Dhaka Skills Development Center',
        division: 'Dhaka',
        district: 'Dhaka',
        subArea: 'Dhanmondi',
        address: 'Road 8, Dhanmondi, Dhaka',
    },
    {
        id: 'tc-03',
        name: 'Uttara Professional Training Hub',
        division: 'Dhaka',
        district: 'Dhaka',
        subArea: 'Uttara',
        address: 'Sector 7, Uttara, Dhaka',
    },
    {
        id: 'tc-04',
        name: 'Gulshan Career Training Center',
        division: 'Dhaka',
        district: 'Dhaka',
        subArea: 'Gulshan',
        address: 'Road 45, Gulshan-2, Dhaka',
    },
    {
        id: 'tc-05',
        name: 'Banani Technical Training Center',
        division: 'Dhaka',
        district: 'Dhaka',
        subArea: 'Banani',
        address: 'Road 11, Banani, Dhaka',
    },
    {
        id: 'tc-06',
        name: 'Mohammadpur Training Institute',
        division: 'Dhaka',
        district: 'Dhaka',
        subArea: 'Mohammadpur',
        address: 'Town Hall Road, Mohammadpur, Dhaka',
    },
    {
        id: 'tc-07',
        name: 'Jatrabari Skills Center',
        division: 'Dhaka',
        district: 'Dhaka',
        subArea: 'Jatrabari',
        address: 'Dania Road, Jatrabari, Dhaka',
    },
    {
        id: 'tc-08',
        name: 'Savar Technical Training Center',
        division: 'Dhaka',
        district: 'Dhaka',
        subArea: 'Savar',
        address: 'Thana Road, Savar, Dhaka',
    },
    {
        id: 'tc-09',
        name: 'Keraniganj Development Center',
        division: 'Dhaka',
        district: 'Dhaka',
        subArea: 'Keraniganj',
        address: 'Zinzira Road, Keraniganj, Dhaka',
    },

    // Gazipur
    {
        id: 'tc-10',
        name: 'Gazipur Skill Development Hub',
        division: 'Dhaka',
        district: 'Gazipur',
        subArea: 'Tongi',
        address: 'Tongi Bazar Road, Gazipur',
    },
    {
        id: 'tc-11',
        name: 'Gazipur Technical Training Center',
        division: 'Dhaka',
        district: 'Gazipur',
        subArea: 'Gazipur Sadar',
        address: 'Joydebpur Road, Gazipur',
    },
    {
        id: 'tc-12',
        name: 'Kaliakair Skills Institute',
        division: 'Dhaka',
        district: 'Gazipur',
        subArea: 'Kaliakair',
        address: 'Kaliakair Bazar, Gazipur',
    },
    {
        id: 'tc-13',
        name: 'Kapasia Training Center',
        division: 'Dhaka',
        district: 'Gazipur',
        subArea: 'Kapasia',
        address: 'Kapasia Bazar Road, Gazipur',
    },

    // Narayanganj
    {
        id: 'tc-14',
        name: 'Narayanganj Tech Academy',
        division: 'Dhaka',
        district: 'Narayanganj',
        subArea: 'Fatullah',
        address: 'Fatullah, Narayanganj',
    },
    {
        id: 'tc-15',
        name: 'Narayanganj Skills Development Center',
        division: 'Dhaka',
        district: 'Narayanganj',
        subArea: 'Narayanganj Sadar',
        address: 'Chashara, Narayanganj',
    },
    {
        id: 'tc-16',
        name: 'Rupganj Training Institute',
        division: 'Dhaka',
        district: 'Narayanganj',
        subArea: 'Rupganj',
        address: 'Rupganj Bazar, Narayanganj',
    },
    {
        id: 'tc-17',
        name: 'Sonargaon Career Center',
        division: 'Dhaka',
        district: 'Narayanganj',
        subArea: 'Sonargaon',
        address: 'Sonargaon Road, Narayanganj',
    },

    // Tangail
    {
        id: 'tc-18',
        name: 'Tangail Technical Training Center',
        division: 'Dhaka',
        district: 'Tangail',
        subArea: 'Tangail Sadar',
        address: 'New Bus Stand Road, Tangail',
    },
    {
        id: 'tc-19',
        name: 'Madhupur Skills Development Center',
        division: 'Dhaka',
        district: 'Tangail',
        subArea: 'Madhupur',
        address: 'Madhupur Bazar, Tangail',
    },

    // Munshiganj
    {
        id: 'tc-20',
        name: 'Munshiganj Training Center',
        division: 'Dhaka',
        district: 'Munshiganj',
        subArea: 'Munshiganj Sadar',
        address: 'Court Road, Munshiganj',
    },
    {
        id: 'tc-21',
        name: 'Sreenagar Skills Center',
        division: 'Dhaka',
        district: 'Munshiganj',
        subArea: 'Sreenagar',
        address: 'Sreenagar Bazar, Munshiganj',
    },

    // Manikganj
    {
        id: 'tc-22',
        name: 'Manikganj Technical Institute',
        division: 'Dhaka',
        district: 'Manikganj',
        subArea: 'Manikganj Sadar',
        address: 'Shahapara Road, Manikganj',
    },
    {
        id: 'tc-23',
        name: 'Saturia Training Center',
        division: 'Dhaka',
        district: 'Manikganj',
        subArea: 'Saturia',
        address: 'Saturia Bazar, Manikganj',
    },

    // Faridpur
    {
        id: 'tc-24',
        name: 'Faridpur Skills Development Center',
        division: 'Dhaka',
        district: 'Faridpur',
        subArea: 'Faridpur Sadar',
        address: 'Goalchamot Road, Faridpur',
    },
    {
        id: 'tc-25',
        name: 'Bhanga Training Institute',
        division: 'Dhaka',
        district: 'Faridpur',
        subArea: 'Bhanga',
        address: 'Bhanga Bazar Road, Faridpur',
    },

    // Gopalganj
    {
        id: 'tc-26',
        name: 'Gopalganj Technical Training Center',
        division: 'Dhaka',
        district: 'Gopalganj',
        subArea: 'Gopalganj Sadar',
        address: 'Sadar Road, Gopalganj',
    },
    {
        id: 'tc-27',
        name: 'Tungipara Skills Center',
        division: 'Dhaka',
        district: 'Gopalganj',
        subArea: 'Tungipara',
        address: 'Tungipara Bazar, Gopalganj',
    },

    // Madaripur
    {
        id: 'tc-28',
        name: 'Madaripur Training Institute',
        division: 'Dhaka',
        district: 'Madaripur',
        subArea: 'Madaripur Sadar',
        address: 'College Road, Madaripur',
    },
    {
        id: 'tc-29',
        name: 'Shibchar Development Center',
        division: 'Dhaka',
        district: 'Madaripur',
        subArea: 'Shibchar',
        address: 'Shibchar Bazar, Madaripur',
    },

    // Shariatpur
    {
        id: 'tc-30',
        name: 'Shariatpur Skills Center',
        division: 'Dhaka',
        district: 'Shariatpur',
        subArea: 'Shariatpur Sadar',
        address: 'Palong Road, Shariatpur',
    },
    {
        id: 'tc-31',
        name: 'Naria Training Center',
        division: 'Dhaka',
        district: 'Shariatpur',
        subArea: 'Naria',
        address: 'Naria Bazar, Shariatpur',
    },

    // =========================
    // EXISTING OTHER DIVISIONS
    // =========================

    {
        id: 'tc-32',
        name: 'Chattogram Port City Training Center',
        division: 'Chattogram',
        district: 'Chattogram',
        subArea: 'Pahartali',
        address: 'Pahartali, Chattogram',
    },
    {
        id: 'tc-33',
        name: "Cox's Bazar Coastal Training Center",
        division: 'Chattogram',
        district: "Cox's Bazar",
        subArea: "Cox's Bazar Sadar",
        address: "Kolatoli Road, Cox's Bazar",
    },
    {
        id: 'tc-34',
        name: 'Rajshahi Training Institute',
        division: 'Rajshahi',
        district: 'Rajshahi',
        subArea: 'Boalia',
        address: 'Shaheb Bazar, Rajshahi',
    },
    {
        id: 'tc-35',
        name: 'Bogura Skills Center',
        division: 'Rajshahi',
        district: 'Bogura',
        subArea: 'Bogura Sadar',
        address: 'Satmatha, Bogura',
    },
    {
        id: 'tc-36',
        name: 'Khulna Regional Training Center',
        division: 'Khulna',
        district: 'Khulna',
        subArea: 'Khalishpur',
        address: 'Khalishpur, Khulna',
    },
    {
        id: 'tc-37',
        name: 'Jashore Development Center',
        division: 'Khulna',
        district: 'Jashore',
        subArea: 'Jashore Sadar',
        address: 'MK Road, Jashore',
    },
    {
        id: 'tc-38',
        name: 'Sylhet Hill Training Center',
        division: 'Sylhet',
        district: 'Sylhet',
        subArea: 'Zindabazar',
        address: 'Zindabazar, Sylhet',
    },
    {
        id: 'tc-39',
        name: 'Barishal River City Training Center',
        division: 'Barishal',
        district: 'Barishal',
        subArea: 'Barishal Sadar',
        address: 'Band Road, Barishal',
    },
    {
        id: 'tc-40',
        name: 'Rangpur Northern Training Center',
        division: 'Rangpur',
        district: 'Rangpur',
        subArea: 'Rangpur Sadar',
        address: 'Station Road, Rangpur',
    },
    {
        id: 'tc-41',
        name: 'Mymensingh Central Training Center',
        division: 'Mymensingh',
        district: 'Mymensingh',
        subArea: 'Mymensingh Sadar',
        address: 'Choto Bazar, Mymensingh',
    },
];

export function getTrainingCenterById(id: string) {
    return trainingCenters.find((tc) => tc.id === id);
}

export function getTrainingCentersByDistrict(district: string) {
    return trainingCenters.filter(
        (tc) => tc.district.toLowerCase() === district.toLowerCase()
    );
}

export function getTrainingCentersByDivision(division: string) {
    return trainingCenters.filter(
        (tc) => tc.division.toLowerCase() === division.toLowerCase()
    );
}