"""
KrishiTech — India's Smart Agriculture Portal
Flask Backend
"""

import os
import google.generativeai as genai
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "KrishiTech-dev-secret")

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
genai.configure(api_key=GEMINI_API_KEY)

CROP_DATA = {
    "kharif": ["Rice", "Maize", "Jowar", "Bajra", "Tur (Arhar)", "Moong", "Urad", "Groundnut", "Soybean"],
    "rabi": ["Wheat", "Barley", "Gram (Chickpea)", "Masur (Lentil)", "Mustard", "Rapeseed", "Safflower", "Sunflower"],
    "zaid": ["Watermelon", "Muskmelon", "Cucumber", "Pumpkin", "Bittergourd", "Fodder Crops"],
    "cash": ["Cotton", "Jute"],
    "flowers": ["Rose", "Marigold", "Rajanigandha", "Tulip", "Sadabahar", "Kusum", "Lily"],
    "horticulture": ["Mango", "Orange", "Apple", "Banana", "Guava", "Papaya", "Pineapple", "Kiwi"],
    "plantation": ["Tea", "Coffee"],
    "modern": ["Aeroponics", "Hydroponics", "Aquaponics"],
}

STATES_DATA = {
    "Andhra Pradesh": ["Visakhapatnam","Vijayawada","Guntur","Nellore","Kurnool","Tirupati","Rajahmundry","Kakinada","Anantapur","Chittoor","Eluru","Ongole","Srikakulam","Vizianagaram"],
    "Arunachal Pradesh": ["Itanagar","Naharlagun","Pasighat","Tawang","Ziro","Bomdila","Roing","Tezu"],
    "Assam": ["Guwahati","Dibrugarh","Jorhat","Silchar","Tezpur","Bongaigaon","Nagaon","Tinsukia","Sivasagar","Diphu","Haflong","Kokrajhar"],
    "Bihar": ["Patna","Gaya","Bhagalpur","Muzaffarpur","Darbhanga","Purnia","Ara","Begusarai","Katihar","Nalanda","Sitamarhi","Madhubani","Samastipur","Munger","Saharsa","Chapra","Hajipur","Aurangabad","Buxar","Nawada","Jehanabad","Kishanganj","Supaul","Madhepura","Sheohar","Vaishali","Lakhisarai","Sheikhpura","Araria","Kaimur","Rohtas","Banka","Jamui","Khagaria","Gopalganj","Siwan","East Champaran","West Champaran"],
    "Chhattisgarh": ["Raipur","Bilaspur","Durg","Bhilai","Korba","Rajnandgaon","Jagdalpur","Ambikapur","Raigarh","Dhamtari"],
    "Goa": ["Panaji","Margao","Vasco da Gama","Mapusa","Ponda","Bicholim"],
    "Gujarat": ["Ahmedabad","Surat","Vadodara","Rajkot","Bhavnagar","Jamnagar","Anand","Gandhinagar","Junagadh","Mehsana","Amreli","Bharuch","Navsari","Valsad","Kutch","Porbandar","Surendranagar"],
    "Haryana": ["Gurugram","Faridabad","Rohtak","Hisar","Panipat","Ambala","Karnal","Sonipat","Yamunanagar","Bhiwani","Sirsa","Jhajjar","Rewari","Mahendragarh","Kaithal","Kurukshetra","Palwal","Mewat","Fatehabad","Panchkula","Jind"],
    "Himachal Pradesh": ["Shimla","Manali","Dharamshala","Mandi","Kullu","Solan","Hamirpur","Bilaspur","Chamba","Una","Kinnaur","Lahaul and Spiti"],
    "Jharkhand": ["Ranchi","Jamshedpur","Dhanbad","Bokaro","Hazaribagh","Giridih","Deoghar","Dumka","Phusro","Chatra","Koderma","Lohardaga"],
    "Karnataka": ["Bengaluru","Mysuru","Hubballi","Mangaluru","Belagavi","Davangere","Shivamogga","Tumakuru","Ballari","Vijayapura","Kalaburagi","Udupi","Hassan","Chikmagalur","Kodagu","Raichur","Koppal","Gadag"],
    "Kerala": ["Thiruvananthapuram","Kochi","Kozhikode","Thrissur","Palakkad","Alappuzha","Kannur","Kollam","Malappuram","Kottayam","Idukki","Wayanad","Kasaragod","Pathanamthitta"],
    "Madhya Pradesh": ["Bhopal","Indore","Jabalpur","Gwalior","Ujjain","Sagar","Rewa","Satna","Dewas","Chhindwara","Ratlam","Vidisha","Mandsaur","Khandwa","Khargone","Betul","Morena","Bhind","Guna","Shivpuri"],
    "Maharashtra": ["Mumbai","Pune","Nagpur","Nashik","Aurangabad","Solapur","Amravati","Kolhapur","Thane","Nanded","Sangli","Satara","Jalgaon","Akola","Latur","Dhule","Raigad","Beed","Chandrapur","Osmanabad","Washim","Yavatmal","Buldhana","Wardha","Gondia","Bhandara","Gadchiroli","Hingoli","Parbhani","Ratnagiri","Sindhudurg"],
    "Manipur": ["Imphal","Thoubal","Bishnupur","Churachandpur","Senapati","Ukhrul","Chandel","Tamenglong"],
    "Meghalaya": ["Shillong","Tura","Jowai","Nongstoin","Baghmara","Resubelpara"],
    "Mizoram": ["Aizawl","Lunglei","Champhai","Serchhip","Kolasib","Mamit"],
    "Nagaland": ["Kohima","Dimapur","Mokokchung","Tuensang","Wokha","Zunheboto","Phek"],
    "Odisha": ["Bhubaneswar","Cuttack","Rourkela","Berhampur","Puri","Sambalpur","Balasore","Baripada","Bhadrak","Koraput","Rayagada","Jharsuguda","Sundargarh","Kendujhar","Dhenkanal"],
    "Punjab": ["Ludhiana","Amritsar","Jalandhar","Patiala","Bathinda","Mohali","Firozpur","Hoshiarpur","Gurdaspur","Moga","Faridkot","Muktsar","Sangrur","Fatehgarh Sahib","Nawanshahr","Barnala","Mansa","Tarn Taran","Kapurthala","Rupnagar"],
    "Rajasthan": ["Jaipur","Jodhpur","Udaipur","Kota","Bikaner","Ajmer","Alwar","Bhilwara","Barmer","Sikar","Sri Ganganagar","Pali","Nagaur","Churu","Jhunjhunu","Dausa","Tonk","Sawai Madhopur","Bundi","Jhalawar","Banswara","Baran","Dungarpur","Rajsamand","Sirohi","Chittorgarh","Karauli","Bharatpur","Dholpur","Hanumangarh","Jaisalmer"],
    "Sikkim": ["Gangtok","Namchi","Gyalshing","Mangan","Rangpo","Jorethang"],
    "Tamil Nadu": ["Chennai","Coimbatore","Madurai","Tiruchirappalli","Salem","Tirunelveli","Erode","Vellore","Tiruppur","Thoothukudi","Thanjavur","Dindigul","Kancheepuram","Cuddalore","Nagapattinam","Krishnagiri","Dharmapuri","Namakkal","Perambalur","Ariyalur","Villupuram","Virudhunagar","Sivagangai","Ramanathapuram","Theni","Tiruvarur","Nilgiris","Karur"],
    "Telangana": ["Hyderabad","Warangal","Nizamabad","Karimnagar","Khammam","Ramagundam","Mahbubnagar","Nalgonda","Adilabad","Medak","Rangareddy","Sangareddy"],
    "Tripura": ["Agartala","Udaipur","Dharmanagar","Kailasahar","Belonia","Sabroom"],
    "Uttar Pradesh": ["Lucknow","Kanpur","Agra","Varanasi","Prayagraj","Meerut","Bareilly","Moradabad","Ghaziabad","Noida","Gorakhpur","Aligarh","Mathura","Muzaffarnagar","Saharanpur","Firozabad","Jhansi","Rampur","Shahjahanpur","Sitapur","Faizabad","Sultanpur","Bijnor","Bulandshahr","Etah","Mainpuri","Jaunpur","Ballia","Deoria","Gonda","Azamgarh","Mirzapur","Sonbhadra","Banda","Hamirpur","Chitrakoot","Fatehpur","Pratapgarh","Kaushambi","Auraiya","Etawah","Unnao","Hardoi","Lakhimpur Kheri","Bahraich","Shravasti","Balrampur","Basti","Sant Kabir Nagar","Maharajganj","Kushinagar","Siddharth Nagar","Ambedkar Nagar","Mau","Ghazipur","Chandauli","Bhadohi","Amethi","Rae Bareli","Barabanki"],
    "Uttarakhand": ["Dehradun","Haridwar","Roorkee","Nainital","Haldwani","Rishikesh","Rudrapur","Kashipur","Kotdwar","Mussoorie","Almora","Pithoragarh","Chamoli","Rudraprayag","Uttarkashi","Tehri","Bageshwar","Champawat","Pauri"],
    "West Bengal": ["Kolkata","Howrah","Durgapur","Asansol","Siliguri","Malda","Burdwan","Haldia","Krishnanagar","Berhampore","Jalpaiguri","Cooch Behar","Darjeeling","Bankura","Bishnupur","Purulia","Kharagpur","Midnapore","Balurghat","Raiganj","Islampur","North 24 Parganas","South 24 Parganas","Hooghly","Nadia","Murshidabad","Birbhum"],
    "Andaman and Nicobar Islands": ["Port Blair","Car Nicobar","Diglipur","Mayabunder","Rangat"],
    "Chandigarh": ["Chandigarh"],
    "Dadra and Nagar Haveli and Daman and Diu": ["Silvassa","Daman","Diu"],
    "Delhi": ["New Delhi","North Delhi","South Delhi","East Delhi","West Delhi","Central Delhi","North East Delhi","South East Delhi","Dwarka","Rohini","Shahdara","North West Delhi","South West Delhi"],
    "Jammu and Kashmir": ["Srinagar","Jammu","Anantnag","Baramulla","Pulwama","Kupwara","Sopore","Kathua","Udhampur","Rajouri","Poonch","Doda","Kishtwar","Ramban","Reasi","Samba","Bandipora","Budgam","Ganderbal","Kulgam","Shopian"],
    "Ladakh": ["Leh","Kargil"],
    "Lakshadweep": ["Kavaratti","Agatti","Minicoy","Amini","Andrott","Kiltan"],
    "Puducherry": ["Puducherry","Karaikal","Mahe","Yanam"],
}


@app.route("/")
def index():
    return render_template(
        "index.html",
        crop_data=CROP_DATA,
        states_data=STATES_DATA,
        api_key=GEMINI_API_KEY,
    )


@app.route("/api/states")
def get_states():
    return jsonify(list(STATES_DATA.keys()))


@app.route("/api/districts/<state>")
def get_districts(state):
    return jsonify(STATES_DATA.get(state, []))


@app.route("/api/crops")
def get_all_crops():
    return jsonify(CROP_DATA)


@app.route("/ai_proxy", methods=["POST"])
def ai_proxy():
    """Server-side proxy — keeps your API key off the browser."""

    if not GEMINI_API_KEY:
        return jsonify({"error": "GEMINI_API_KEY not configured"}), 500

    body = request.get_json(force=True)
    messages = body.get("messages", [])

    user_message = messages[-1]["content"] if messages else ""

    try:
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
        system_instruction=(
            "You are KrishiTech, an expert agricultural assistant specialising in Indian farming. "
            "You have deep knowledge of all Indian crops, soil science, agro-climatic zones of India, "
            "modern farming techniques (Hydroponics, Aeroponics, Aquaponics), organic and Ayurvedic "
            "farming practices (Panchagavya, Jeevamrutha, Beejamrutha), plant diseases and traditional "
            "herbal remedies. Always prioritise natural and organic solutions. "
            "Use Markdown formatting with tables where appropriate. "
            "Be comprehensive yet practical for Indian farmers."
        ),
        )
        response = model.generate_content(user_message)
        return jsonify({"text": response.text})
    except Exception as e:
        print(f"Gemini Error: {e}")
        return jsonify({"error": "AI Service currently unavailable"}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "True").lower() == "true"
    print(f"\n  KrishiTech starting on http://127.0.0.1:{port}")
    if not GEMINI_API_KEY:
        print("  WARNING: GEMINI_API_KEY not configured — AI features will not work!")
    else:
        print("  Gemini API key loaded OK.")
    app.run(debug=debug, port=port)