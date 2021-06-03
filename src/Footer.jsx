import React, {useEffect, useState} from "react";
import {MDBCol, MDBContainer, MDBRow, MDBFooter, MDBCard, MDBBox, MDBBtn} from "mdbreact";

const CookieConsent = () => {

  const [showConsent, setShowConsent] = useState(false);

  return (
    showConsent ?
      <MDBContainer style={{bottom: 10, left: 10}} fluid className="fixed-bottom">
        <MDBRow>
          <MDBCol sm="12" md="4" lg="3">
            <MDBCard className="m-3 special-color p-3">
              <MDBBox id="modal-title">
                This website uses cookies.
              </MDBBox>
              <MDBBox align="justify" className="small">
                We use cookies and stores them on your computer. Some cookies are essential, others help us to improve
                your
                experience by providing insights into how the site is being used.
              </MDBBox>
              <MDBBtn onClick={handleClick} type="submit" size="sm" color="primary">Accept</MDBBtn>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
      : null
  )
}

const Footer = () => {
  return (
    <MDBFooter color="unique-color" className="font-small pt-4">
      <MDBContainer fluid className="text-center white-text">
        <MDBRow className="d-flex align-items-center">
          <MDBCol size="12">
            <p className="text-center white-text">
              <a href="/">SputnikDAO 2</a> {new Date().getFullYear()}. The software is an <a
              className="white-text" target="_blank" rel="nofollow" href="https://github.com/near-daos/sputnik-dao-ui">open
              source</a> and provided “as is”, without warranty of any kind.</p>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </MDBFooter>
  );
};

export default Footer;
