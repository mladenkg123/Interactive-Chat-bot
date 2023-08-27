import './heroCss.css';
import { PricingDetail, PricingSlot, PricingTable } from 'react-pricing-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCogs, faRobot, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css'; 



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


  return (

    <div className="Home_container_13EVf" id="homeContainer">
      

    <section className="Home_part1__Xn7G4">
      <h1>Chat with Cube-BOT online.</h1>
      <p>Ask Cube-BOT to generate a response!</p>
    </section>

    <section className="Home_about__3GJD3">
      <div>
        <div>
          <h2>AI Chatbot: Ask and Talk to AI about Anything</h2>
          <span>
            The free chatbot by Cube-BOT that can answer any question you may have. It's user-friendly and easy to
            interact with, simply type your question and get a response. Try it now and see how it can help you!
          </span>
          <div className="Home_txt__mutBF">
            <i>How to make a cup of latte in short</i>
            <i>Which type of diet is the healthiest</i>
            <i>Write an apology letter to a customer</i>
            <i>Write a 4-line funny poem</i>
            <i>Write a horror story in one sentence</i>
            <i>Birthday wishes for friend to write in a card</i>
          </div>
        </div>
        <img src="src/assets/1.png" alt="AI Chatbot: Ask and Talk to AI about Anything" />
      </div>
      <div>
        <div>
            <h2>Chat with AI-Powerd Character Asistants</h2>
            <span>Cube-BOT offers AI character assistants who can provide informative conversations on various topics, including education, careers, business, lifestyle, and more. Whether you need assistance with language learning, gaining knowledge, creative inspiration, business strategies, or a healthier lifestyle, our chatbot is here for you.</span>
            <a href="/ChatBot">Chat Now &gt;</a></div>
            <img src="src/assets/2.png" alt="Chat with AI-Powerd Character Asistants"/></div>
    </section>

    <section className="Home_feature__2hbt-" data-aos="zoom-in">
        <h2>Cube-BOT: Chat, Answer, Create, Inspire, and More</h2>
        <p>Discover the limitless potential of AI with Cube-BOT now!</p>
        <div className="Home_featureList__3yC4P">
            <span> <FontAwesomeIcon icon={faRobot} style={{color:"#646cff"}} /> GPT powers our AI chatbot, delivering high-quality and expert-level content.</span>
            <span> <FontAwesomeIcon icon={faCogs}  style={{color:"#646cff"}}/> Easily accessible online, our AI chat website is both free and user-friendly.</span>
            <span> <FontAwesomeIcon icon={faShieldAlt} style={{color:"#646cff"}}/> Prioritizing information security, and data protection assured on Cube-BOT.</span>
        </div>
    </section>
    <section id="pricingContainer" style={{margin:"50px auto 0", padding:"550px 20px"}} data-aos="flip-right" data-aos-delay="550">
        {/* PRICING SECTION */}
        <div className="pricing-section">
          <h2>Pricing Plans</h2>
          <PricingTable highlightColor="#ffd700">
            <PricingSlot title="Free Plan" price="$0">
              <PricingDetail>Basic features included</PricingDetail>
              <PricingDetail>100 queries/month</PricingDetail>
              <button className="pricing-button" onClick={handleRegisterClick}>
                Sign Up
              </button>
            </PricingSlot>
            <PricingSlot title="Pro Plan" price="$9.99">
              <PricingDetail>All features included</PricingDetail>
              <PricingDetail>Unlimited queries/month</PricingDetail>
              <button className="pricing-button" onClick={handleRegisterClick}>
                Sign Up
              </button>
            </PricingSlot>
            <PricingSlot title="Business Plan" price="$19.99">
              <PricingDetail>Priority support</PricingDetail>
              <PricingDetail>Unlimited queries/month</PricingDetail>
              <button className="pricing-button" onClick={handleRegisterClick}>
                Sign Up
              </button>
            </PricingSlot>
          </PricingTable>
        </div>
      </section>


      <section className="About_feature" id="aboutContainer" data-aos="fade-up">
        <div className="About_feature_container">
          <div className="About_feature_image">
            <img src="src/assets/3.png" alt="About Cube-BOT" />
          </div>
          <div className="About_feature_text">
            <h2>About Cube-BOT</h2>
            <p>
              Cube-BOT is a revolutionary AI chatbot designed to provide insightful
              and informative conversations. With cutting-edge technology and a
              friendly interface, Cube-BOT is here to answer your questions, assist you
              in your learning journey, and offer creative inspiration. Our goal is to
              make your interactions with Cube-BOT enjoyable and enriching, helping you
              achieve more in less time.
            </p>
          </div>
        </div>
        <div className="About_feature_extra">
          <div className="About_feature_extra_item">
            <h3>Benefits of Cube-BOT</h3>
            <ul>
              <li>Instant responses to your queries</li>
              <li>Access to expert-level knowledge</li>
              <li>Creative inspiration for various topics</li>
              <li>Support for language learning</li>
            </ul>
          </div>
          <div className="About_feature_extra_item">
            <h3>Our Mission</h3>
            <p>
              Our mission is to empower individuals with AI technology that enhances
              their productivity, learning, and creativity. We strive to provide an
              AI chatbot that not only answers questions but also inspires and assists
              users in achieving their goals.
            </p>
          </div>
        </div>
      </section>

  </div>
);
}




export default Hero;
