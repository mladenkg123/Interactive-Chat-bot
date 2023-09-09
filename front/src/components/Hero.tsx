import './heroCss.css';
import { PricingDetail, PricingSlot, PricingTable } from 'react-pricing-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCogs, faRobot, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import { useEffect} from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css'; 
import Cookies from 'universal-cookie';
import Swal from 'sweetalert2';
import { Link as ScrollLink } from 'react-scroll'; 
import {
  sendEmail
} from '../logic/api';



type HeroProps = {
  handleRegisterClick: () => void;
};


function Hero({ handleRegisterClick }: HeroProps) {

  useEffect(() => {
    AOS.init({
      duration: 1500,
      easing: 'ease-in-cubic',
      mirror: 'true',
      offset: 120,
      delay: 250,
    });
  }, []);

  const cookies = new Cookies();
 

  const preventLogin = async () => {

    const jwtExists = cookies.get('jwt') as string;
    
    if (jwtExists == undefined) {
      await Swal.fire({
        title: 'Morate se ulogovati!',
        text: 'Morate se ulogovati kako bi pristupili ovoj stranici.',
        icon: 'error',
        showCancelButton: false,
        confirmButtonText: 'Zatvori',
        customClass: {
          confirmButton: 'swal-button swal-button--error'
        }
      }).then(() => {
        close();
      });
    }
    else {
      window.location.href = '/ChatBot'; 
    }
  }

  const handleEmail = async (event) => {
      event.preventDefault();

      const emailInput  = document.getElementById('mail');
      const messageInput = document.getElementById('message');
      
      const email = emailInput.value;
      const message = messageInput.value;

      try{
        const emailPromise = await sendEmail(email, message)
        if(emailPromise.status === 200){

          const emailResponse = await emailPromise.json() as emailResponse;
          console.log(emailResponse);
        }
        else {
          console.error('Error fetching previous conversations');
        }
      } 
      catch (error) {
        console.error('Error:', error);
      }

  }

  return (

    <div className="Home_container_13EVf" id="homeContainer">
      

    <section className="Home_part1__Xn7G4">
      <h1>Četujte sa Cube-BOT-om onlajn!</h1>
      <p>Pitajte Cube-BOT-a da generiše odgovor!</p>
    </section>

    <section className="Home_about__3GJD3">
      <div>
        <div>
          <h2>AI četbot: Postavite pitanje i razgovarajte s veštačkom inteligencijom o bilo čemu.</h2>
          <span>
          Besplatan četbot od strane Cube-BOT-a koji može odgovoriti na sva vaša pitanja. Korisniku prijateljski nastrojen i jednostavan za interakciju, samo unesite svoje pitanje i dobijte odgovor. Isprobajte ga sada i vidite kako vam može pomoći!
          </span>
          <div className="Home_txt__mutBF">
            <i>Uputstvo za pripremu ukusne šolje kafe u nekoliko jednostavnih koraka.</i>
            <i>Kojom ishranom do što boljeg zdravlja?</i>
            <i>Napiši mi najpopularije modele automobila u prethodnoj godini.</i>
            <i>Ispričaj mi zanimljivu priču u samo jednoj rečenici.</i>
            <i>Pronađi mi savršenu rođendansku želju koja će ostaviti poseban utisak.</i>
          </div>
        </div>
        <img src="src/assets/1.png" alt="AI Chatbot" />
      </div>
      <div>
        <div>
            <h2>Razgovarajte sa sa različitim AI modelima i testirajte njihove mogućnosti!</h2>
            <span>Cube-BOT nudi različite AI modele koji mogu pružiti informativne razgovore o različitim temama, uključujući obrazovanje, karijeru, poslovanje, način života i još mnogo toga. Bez obzira da li vam je potrebna pomoć u učenju jezika, sticanju znanja, poslovnim strategijama ili zdravijem načinu života, naš četbot je tu za vas.</span>
            <button className='href' onClick={preventLogin}>Četuj sada &gt;</button></div>
            <img src="src/assets/2.png" alt="Chat with AI-Powerd Character Asistants"/></div>
    </section>

    <section className="Home_feature__2hbt-" data-aos="zoom-in">
        <h2>Cube-BOT: Četujte, odgovarajte, stvarajte, informišite se i mnogo više.</h2>
        <p>Istražite neograničene potencijale veštačke inteligencije uz Cube-BOT sada!</p>
        <div className="Home_featureList__3yC4P">
            <span> <FontAwesomeIcon icon={faRobot} style={{color:"#646cff"}} /> GPT i Llama modeli pokreću našeg AI četbota, pružajući visokokvalitetan sadržaj na stručnom nivou.</span>
            <span> <FontAwesomeIcon icon={faCogs}  style={{color:"#646cff"}}/> Lako dostupna na mreži, naša veb stranica za AI čet je besplatna i jednostavna za korišćenje.</span>
            <span> <FontAwesomeIcon icon={faShieldAlt} style={{color:"#646cff"}}/>Dajući prioritet sigurnosti informacija, Cube-BOT garantuje zaštitu podataka.</span>
        </div>
    </section>
    <section id="pricingContainer" style={{margin:"50px auto 0", padding:"550px 20px"}} data-aos="flip-right" data-aos-delay="550">
        {/* PRICING SECTION */}
        <div className="pricing-section">
          <h2>Cenovnik : </h2>
          <PricingTable highlightColor="#ffd700">
            <PricingSlot title="Besplatan Plan" price="$0Month">
              <PricingDetail>Cena: $0</PricingDetail>
              <PricingDetail>Basic features included</PricingDetail>
              <PricingDetail>100 promptova/mesečno</PricingDetail>
              <button className="pricing-button" onClick={handleRegisterClick}>
                Registruj se
              </button>
            </PricingSlot>
            <PricingSlot title="Pro Plan" price="$9.99">
              <PricingDetail>Cena: $9.99</PricingDetail>
              <PricingDetail>Svi sadržaji uključeni</PricingDetail>
              <PricingDetail>5000 promptova/mesečno</PricingDetail>
              <button className="pricing-button" onClick={handleRegisterClick}>
                Registruj se
              </button>
            </PricingSlot>
            <PricingSlot title="Biznis Plan" price="$19.99">
              <PricingDetail>Cena: $19.99</PricingDetail>
              <PricingDetail>Prioritetna podrška</PricingDetail>
              <PricingDetail>Neograničeno promptova/mesečno</PricingDetail>
              <button className="pricing-button" onClick={handleRegisterClick}>
                Registruj se
              </button>
            </PricingSlot>
          </PricingTable>
        </div>
      </section>

      <section className='Contact_feature' id="contactContainer" data-aos="fade-up">
        <div className='Contact1'>
         <div className='Contact2'>
          <div className='Contact3'>
            <h1>Kontaktirajte nas</h1>   
            <p>Sva pitanja ili nedoumice koje imate mozete poslati u poruci ispod.</p>
            <p>Trazite premijum plan? <a href="mailto:cvetkovicmladen00@gmail.com" className="dRExZB">Kontaktirajte nas</a> ili pogledajte 
            <a href="" className="dRExZB">
              <ScrollLink to="pricingContainer" smooth={true} duration={750} offset={200} spy={true}>
              cenovnik
              </ScrollLink></a>.</p>
            <form className="gZEnfn flex flex-col mt-5" data-cb-wrapper="true" onSubmit={handleEmail}>
              <label htmlFor="email" className="ixUjRF">Email</label>
              <input type="email" placeholder="Ko nam salje mail?" name="email" className="hewnsr" id='mail'/>
                <label htmlFor="message" className="ixUjRF">Message</label>
                <textarea rows={7} placeholder="Vasa poruka..." name="message" className="hewnsr" id='message'></textarea>
                <div className="jBhLFp">
                  <input type="submit" className="idYhuh" value="Send Message"/>
                </div>
             </form>
          </div>
         </div>
        </div>
      </section>


      <section className="About_feature" id="aboutContainer" data-aos="fade-up">
        <div className="About_feature_container">
          <div className="About_feature_image">
            <img src="src/assets/3.png" alt="About Cube-BOT" />
          </div>
          <div className="About_feature_text">
            <h2>O Cube-BOT-u :</h2>
            <p>
            Cube-BOT je revolucionarni AI četbot dizajniran da pruži duboke i informativne razgovore. 
            Sa najsavremenijom tehnologijom i korisnički prijateljskim interfejsom, Cube-BOT je tu da odgovori na vaša pitanja, pomogne vam u vašem procesu učenja i pruži kreativnu inspiraciju. 
            Naš cilj je da vaši interakcije sa Cube-BOT budu prijatne i obogaćujuće, pomažući vam da postignete više u manje vremena.
            </p>
          </div>
        </div>
        <div className="About_feature_extra">
          <div className="About_feature_extra_item">
          <h3>Prednosti Cube-BOT-a</h3>
            <ul>
              <li>Brzi odgovori na vaša pitanja</li>
              <li>Pristup stručnom znanju</li>
              <li>Kreativna inspiracija za različite teme</li>
              <li>Podrška za učenje jezika</li>
            </ul>
          </div>
          <div className="About_feature_extra_item">
          <h3>Naša Misija</h3>
            <p>
              Naša misija je osnažiti pojedince AI tehnologijom koja poboljšava njihovu produktivnost, učenje i kreativnost. Trudimo se da predstavimo AI četbota koji ne samo da odgovara na pitanja, već i inspiriše i pomaže korisnicima da postignu svoje ciljeve.
            </p>
          </div>
        </div>
      </section>

  </div>
);
}




export default Hero;
