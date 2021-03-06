/**
 * Created by admin-pc on 2019/2/1.
 */
import React, {Component} from 'react'
import {StyleSheet, Text, View, TextInput, TouchableOpacity, ToastAndroid, Dimensions, Image } from 'react-native'
import {Button, Flex, WhiteSpace, WingBlank} from '@ant-design/react-native';
import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios'
import systemConfig from '../../config/system'
import UserStore from './../../mobx/userStore'



class AccountRegister extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userName: '',
      pwd: '',
      smsCode: '',
      smsCodeText: '获取验证码',
      axiosUrl: systemConfig.axiosUrl,
      timeNum: systemConfig.timeNum,
      isDisabled: false,
    }
  }
  
  _test() {
    console.log(123);
  }
  //判断是否为手机号码
  _isPhone(phone) {
    console.log(phone);
    let myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
    console.log(myreg.test(phone));
    return myreg.test(phone)
  }
  _earnSmsCode() {
    console.log('abc');
    console.log(this.state.phone);
    let phone = this.state.phone;
    if(!this._isPhone(phone)) {
      ToastAndroid.show('请正确输入手机号', ToastAndroid.SHORT);
      return;
    }
    this.setState({
      isDisabled: true
    });
    let timeNum = this.state.timeNum;
    if(timer){
      clearInterval(timer);
    }
    let timer = setInterval(() =>{
      timeNum--;
      if(timeNum === 0){
        clearInterval(timer);
        this.setState({
          smsCodeText: '获取验证码',
          timeNum: this.state.timeNum,
          isDisabled: false
        });
        return;
      }
      this.setState({
        smsCodeText: `重新发送${timeNum}s`,
      })
    }, 1000);
    
    axios.post(systemConfig.axiosUrl + 'user/getVarifyCode', {phone}).then(res =>{
      console.log('获取验证码后端传回参数' + JSON.stringify(res));
    }).catch(err =>{
      console.log('接口报错' + err);
    })
    
  };
  _storeUserData = async (obj) => {
    try {
      await AsyncStorage.setItem('phone', obj.phone);
      await AsyncStorage.setItem('pwd', obj.pwd);
    } catch (e) {
      // saving error
    }
  };
  _retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('abcd');
      if (value !== null) {
        // We have data!!
        console.log(value);
      }
    } catch (error) {
      // Error retrieving data
    }
  };
  _registerAccount() {
    console.log('注册账户');
    let {phone, pwd, smsCode} = this.state;
    let SMSCode = smsCode;
    if(!(phone && pwd && smsCode)){
      ToastAndroid.show('请输入完整信息', ToastAndroid.SHORT);
      return;
    }
    let accountObj = {
      phone,
      pwd,
      SMSCode
    };
    console.log(systemConfig.axiosUrl);
    axios.post(systemConfig.axiosUrl + 'user/register', accountObj).then((res) =>{
      console.log('注册号码then');
      let {data} = res;
      console.log(data);
      switch (data.code){
        case 200:
          console.log('abcd' + phone);
          ToastAndroid.show('注册成功', ToastAndroid.SHORT);
          this.props.navigation.navigate('Login');
          this._storeUserData(accountObj);
          this._retrieveData();
          break;
        case 300: ToastAndroid.show('该账户号码已注册', ToastAndroid.SHORT); break;
        case 301: ToastAndroid.show('验证码错误或已使用', ToastAndroid.SHORT); break;
        case 302: ToastAndroid.show('验证码已过期', ToastAndroid.SHORT);break;
        case 303: ToastAndroid.show('请获取验证码', ToastAndroid.SHORT); break;
        default: ToastAndroid.show('系统错误---联系管理员', ToastAndroid.SHORT); break;
      }
    }).catch(err => {
      console.log('接口报错' + JSON.stringify(err));
    })
  }
  
  
  render() {
    let axiosUrl = systemConfig.axiosUrl;
    console.log('9999' + UserStore.api);
    return (
        <View style={styles.register_box}>
          <Image style={styles.register_logo} source={require('./../image/logo.png')}/>
          <Text style={styles.register_title}>招聘平台</Text>
          <Flex style={styles.register_main} direction="row">
            <View style={styles.register_item}>
              <TextInput
                  placeholder='请输入手机号'
                  maxLength = {13}
                  keyboardType='numeric'
                  value={this.state.phone}
                  onChangeText={(phone) => {
                    const newPhone = phone.replace(/[^\d]+/, '');
                    console.log(newPhone);
                    this.setState({
                      phone: newPhone
                    })
                  }}/>
              <Button disabled={this.state.isDisabled} style={styles.register_earn_smscode_text} onPress={this._earnSmsCode.bind(this)}>{this.state.smsCodeText}</Button>
            </View>
            <View style={styles.register_item}>
              <TextInput placeholder='请输入验证码'
                         onChangeText={(smsCode) => {
                           this.setState({
                             smsCode: smsCode
                           })
                         }}/>
            </View>
            <View style={styles.register_item}>
              <TextInput
                  placeholder='请设置登录密码'
                  onChangeText={(pwd) => {
                    this.setState({
                      pwd: pwd
                    })
                  }}/>
            </View>
            <Button type="primary" style={styles.earn_smsCode} onPress={this._registerAccount.bind(this)}>确认</Button>
          </Flex>
        </View>
    )
  }
  
}
const styles = StyleSheet.create({
  register_box: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    // borderColor: 'red',
    // borderWidth: 5,
    // borderStyle: 'solid'
  },
  register_title: {
    fontSize: 20,
    padding: 10,
  },
  register_logo: {
    height: 100,
    width: 100,
    marginTop: 100,
  },
  register_main: {
    backgroundColor: 'white',
    height: 390,
    width: 350,
    flexDirection: 'column',
    justifyContent: 'space-evenly'
    // borderColor: 'red',
    // borderWidth: 2,
    // borderStyle: 'solid'
  },
  register_item: {
    height: 50,
    width: 310,
    flexDirection: 'row',
    // borderBottomColor: 'red',
    // borderBottomWidth: 2,
    borderColor: '#f6f6f8',
    borderWidth: 2,
    borderStyle: 'solid',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  register_earn_smscode_text: {
    width: 140
  },
  earn_smsCode: {
    // backgroundColor: 'red',
    width: 300,
  }
})

export default AccountRegister