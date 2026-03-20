import React from 'react';
import {InputTextField} from '../../components/UI/InputTextField';
import {getSocials, setSocials} from '../../store/actions/profileActions';
import {connect} from 'react-redux';
import {translate} from '../../locales/locales';
import SocialsForm from "../../components/Forms/SocialsForm";


class EditSocialsPage extends React.Component {
  componentDidMount() {
    this.props.getSocials();
  }

  onSubmit = ({socials}) => {
    this.props.setSocials(socials
      .filter(soc => soc.url)
      .map(soc => soc.url))
      .then(res => res.success && this.props.history.push('/profile/edit'));
  }

  render() {
    const {user, history} = this.props;
    const {data} = this.props.socialNetworks;
    return (
      <SocialsForm
        socials={data}
        onSubmit={this.onSubmit}
        onBack={() => history.push('/profile/edit')}
      >
        <InputTextField
          name="main"
          label={translate("Социальные сети", "org.socialNetworks")}
          value={`@apofiz/${(user && user.username.replace(' ', '')) || 'username'}`}
          onCopy
          disabled
        />
      </SocialsForm>
    )
  }
}

const mapStateToProps = state => ({
  user: state.userStore.user,
  socialNetworks: state.profileStore.socialNetworks
})

const mapDispatchToProps = dispatch => ({
  getSocials: () => dispatch(getSocials()),
  setSocials: socials => dispatch(setSocials(socials))
});

export default connect(mapStateToProps, mapDispatchToProps)(EditSocialsPage);