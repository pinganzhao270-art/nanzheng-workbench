import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import { supabase } from './lib/supabase';

const NAV = [
  { id: 'home', label: '首页', icon: '⌂' },
  { id: 'products', label: '商品', icon: '▦' },
  { id: 'orders', label: '订单', icon: '▤' },
  { id: 'team', label: '团队', icon: '♙' },
  { id: 'stats', label: '统计', icon: '▥' },
];
const C = { navy:'#102B52', blue:'#245B9B', pale:'#EEF3F9', bg:'#F5F7FA', white:'#FFFFFF', ink:'#172B45', muted:'#7B8797', line:'#E5EAF0', green:'#16845B', red:'#B42318' };

function Button({title,onPress,light=false,disabled=false}) {
  return <TouchableOpacity disabled={disabled} onPress={onPress} style={{backgroundColor:disabled?'#AAB7C7':(light?C.pale:C.navy),paddingVertical:14,paddingHorizontal:18,borderRadius:12,alignItems:'center'}}>
    <Text style={{color:light?C.navy:C.white,fontSize:15,fontWeight:'700'}}>{title}</Text>
  </TouchableOpacity>;
}
function Tile({icon,title,subtitle,onPress}) {
  return <TouchableOpacity onPress={onPress} style={{width:'48%',backgroundColor:C.white,borderRadius:16,padding:16,marginBottom:12,borderWidth:1,borderColor:C.line}}>
    <Text style={{fontSize:24,color:C.blue,marginBottom:12}}>{icon}</Text>
    <Text style={{fontSize:16,fontWeight:'700',color:C.ink}}>{title}</Text>
    <Text style={{fontSize:12,color:C.muted,marginTop:5}}>{subtitle}</Text>
  </TouchableOpacity>;
}
function Header({title,sub}) {
  return <View style={{marginBottom:20}}><Text style={{fontSize:25,fontWeight:'800',color:C.ink}}>{title}</Text>{!!sub&&<Text style={{fontSize:13,color:C.muted,marginTop:6}}>{sub}</Text>}</View>;
}
function Empty({title,desc}) {
  return <View style={{backgroundColor:C.white,borderRadius:16,padding:24,alignItems:'center',borderWidth:1,borderColor:C.line,marginTop:8}}>
    <Text style={{fontSize:32,color:'#AAB7C7',marginBottom:12}}>▤</Text>
    <Text style={{fontSize:16,fontWeight:'700',color:C.ink}}>{title}</Text>
    <Text style={{fontSize:13,color:C.muted,textAlign:'center',marginTop:8,lineHeight:20}}>{desc}</Text>
  </View>;
}

async function checkWorkspaceAccess(user) {
  if (!user?.id || !user?.email) throw new Error('无法读取账号信息，请重新登录。');
  const { data: admin, error: adminError } = await supabase
    .from('store_admins').select('email').eq('email', user.email).maybeSingle();
  if (adminError) throw adminError;
  if (admin) return '店主';
  const { data: member, error: memberError } = await supabase
    .from('store_team_members').select('user_id').eq('user_id', user.id).maybeSingle();
  if (memberError) throw memberError;
  if (member) return '团队成员';
  throw new Error('此账号尚未获得南政工作台访问权限，请联系店主添加。');
}

export default function App() {
  const [session,setSession] = useState(null);
  const [role,setRole] = useState('');
  const [authReady,setAuthReady] = useState(false);
  const [busy,setBusy] = useState(false);
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [tab,setTab] = useState('home');
  const [notice,setNotice] = useState('');

  useEffect(() => {
    let alive = true;
    const applySession = async (nextSession) => {
      if (!nextSession?.user) {
        if (alive) { setSession(null); setRole(''); setAuthReady(true); }
        return;
      }
      try {
        const nextRole = await checkWorkspaceAccess(nextSession.user);
        if (alive) { setSession(nextSession); setRole(nextRole); setNotice(''); setAuthReady(true); }
      } catch (error) {
        await supabase.auth.signOut();
        if (alive) { setSession(null); setRole(''); setNotice(error.message || '账号无权访问工作台。'); setAuthReady(true); }
      }
    };
    supabase.auth.getSession().then(({data, error}) => {
      if (error) throw error;
      return applySession(data.session);
    }).catch(error => {
      if (alive) { setNotice(error.message || '登录状态读取失败。'); setAuthReady(true); }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      // Defer database lookups so the auth callback does not block Supabase's internal lock.
      Promise.resolve().then(() => applySession(nextSession));
    });
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, []);

  const signIn = async () => {
    if (!email.trim() || !password) { setNotice('请输入邮箱和密码。'); return; }
    setBusy(true); setNotice('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({email:email.trim().toLowerCase(), password});
      if (error) throw error;
      const accessRole = await checkWorkspaceAccess(data.user);
      setSession(data.session); setRole(accessRole); setPassword(''); setTab('home');
      setNotice('');
    } catch (error) {
      setNotice(error.message || '登录失败，请检查邮箱和密码。');
    } finally { setBusy(false); }
  };
  const signOut = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signOut();
    setBusy(false);
    if (error) setNotice(error.message || '退出失败，请重试。');
    else { setSession(null); setRole(''); setTab('home'); setPassword(''); setNotice('已安全退出。'); }
  };

  if (!authReady) return <SafeAreaView style={{flex:1,backgroundColor:C.navy,alignItems:'center',justifyContent:'center'}}>
    <StatusBar barStyle="light-content" /><ActivityIndicator color="#FFFFFF" size="large" />
    <Text style={{color:'#FFFFFF',marginTop:14}}>正在安全连接南政工作台…</Text>
  </SafeAreaView>;

  if (!session) return <SafeAreaView style={{flex:1,backgroundColor:C.navy}}>
    <StatusBar barStyle="light-content" />
    <View style={{flex:1,justifyContent:'center',padding:26}}>
      <View style={{width:66,height:66,borderRadius:20,backgroundColor:'#FFFFFF',alignItems:'center',justifyContent:'center',marginBottom:24}}>
        <Text style={{fontSize:32,color:C.navy,fontWeight:'900'}}>南</Text>
      </View>
      <Text style={{fontSize:30,fontWeight:'900',color:C.white}}>南政工作台</Text>
      <Text style={{fontSize:15,color:'#D2DDEC',marginTop:8,marginBottom:34}}>私人团队 · 商品与订单管理</Text>
      <View style={{backgroundColor:C.white,borderRadius:20,padding:22}}>
        <Text style={{fontSize:20,fontWeight:'800',color:C.ink,marginBottom:18}}>欢迎登录</Text>
        <Text style={{fontSize:13,color:C.muted,marginBottom:7}}>邮箱</Text>
        <TextInput value={email} onChangeText={setEmail} placeholder="请输入邮箱" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" style={{borderWidth:1,borderColor:C.line,borderRadius:11,padding:13,marginBottom:14,color:C.ink}} />
        <Text style={{fontSize:13,color:C.muted,marginBottom:7}}>密码</Text>
        <TextInput value={password} onChangeText={setPassword} placeholder="请输入密码" secureTextEntry autoCapitalize="none" style={{borderWidth:1,borderColor:C.line,borderRadius:11,padding:13,marginBottom:18,color:C.ink}} />
        <Button title={busy?'正在登录…':'登录南政工作台'} disabled={busy} onPress={signIn} />
        {!!notice && <Text style={{fontSize:12,color:C.red,textAlign:'center',marginTop:12,lineHeight:18}}>{notice}</Text>}
        <Text style={{fontSize:11,color:C.muted,textAlign:'center',marginTop:13}}>仅限店主及已获授权的团队成员登录</Text>
      </View>
      <Text style={{color:'#B9C9DC',fontSize:11,textAlign:'center',marginTop:22}}>私人内部使用 · 不开放公众注册</Text>
    </View>
  </SafeAreaView>;

  const go = (id)=>{setTab(id);setNotice('');};
  const title = ({home:'工作台首页',products:'商品管理',orders:'订单中心',team:'团队成员',stats:'经营统计'})[tab];
  return <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
    <StatusBar barStyle="dark-content" />
    <View style={{backgroundColor:C.white,paddingHorizontal:20,paddingTop:12,paddingBottom:14,borderBottomWidth:1,borderBottomColor:C.line,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
      <View><Text style={{fontSize:18,fontWeight:'900',color:C.navy}}>南政工作台</Text><Text style={{fontSize:11,color:C.muted,marginTop:2}}>{role} · 私人团队管理系统</Text></View>
      <TouchableOpacity disabled={busy} onPress={signOut} style={{backgroundColor:C.pale,paddingHorizontal:12,paddingVertical:8,borderRadius:10}}><Text style={{color:C.navy,fontWeight:'700',fontSize:12}}>退出</Text></TouchableOpacity>
    </View>
    <ScrollView contentContainerStyle={{padding:18,paddingBottom:30}}>
      {tab==='home' && <>
        <View style={{backgroundColor:C.navy,borderRadius:18,padding:20,marginBottom:18}}>
          <Text style={{fontSize:13,color:'#D6E2F0'}}>你好，{role}</Text>
          <Text style={{fontSize:24,color:C.white,fontWeight:'900',marginTop:7}}>今天也一起加油</Text>
          <Text style={{fontSize:12,color:'#D6E2F0',marginTop:8}}>店铺：南政工作台　·　货币：CNY</Text>
        </View>
        <Header title="工作功能" sub="选择要进入的管理页面" />
        <View style={{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between'}}>
          <Tile icon="▦" title="商品管理" subtitle="查看商品与库存" onPress={()=>go('products')} />
          <Tile icon="▤" title="订单中心" subtitle="查看订单处理情况" onPress={()=>go('orders')} />
          <Tile icon="♙" title="团队成员" subtitle="查看团队成员" onPress={()=>go('team')} />
          <Tile icon="▥" title="经营统计" subtitle="查看经营数据" onPress={()=>go('stats')} />
        </View>
        <View style={{backgroundColor:C.white,borderRadius:16,padding:16,borderWidth:1,borderColor:C.line}}>
          <Text style={{fontWeight:'800',color:C.ink,fontSize:15}}>账号信息</Text>
          <Text style={{color:C.muted,fontSize:13,marginTop:7}}>{session.user.email}</Text>
          <Text style={{color:C.green,fontSize:12,marginTop:6}}>已通过 Supabase 身份验证</Text>
        </View>
      </>}
      {tab==='products' && <><Header title="商品管理" sub="统一查看店铺商品资料" /><Empty title="商品列表页面已建立" desc="商品数据接入后，这里会显示商品图片、名称、售价、库存与分类。" /><View style={{marginTop:16}}><Button title="返回首页" light onPress={()=>go('home')} /></View></>}
      {tab==='orders' && <><Header title="订单中心" sub="集中查看团队订单" /><Empty title="订单列表页面已建立" desc="订单数据接入后，这里会显示订单编号、下单时间、金额、付款与处理状态。" /><View style={{marginTop:16}}><Button title="返回首页" light onPress={()=>go('home')} /></View></>}
      {tab==='team' && <><Header title="团队成员" sub="私人团队账号与权限" /><View style={{backgroundColor:C.white,borderRadius:16,padding:17,borderWidth:1,borderColor:C.line}}><Text style={{fontSize:15,fontWeight:'800',color:C.ink}}>权限原则</Text><Text style={{fontSize:13,color:C.muted,lineHeight:21,marginTop:8}}>店主负责管理；团队成员使用自己的邮箱和密码登录，只能查看获授权的商品与订单。</Text><Text style={{fontSize:12,color:C.blue,marginTop:14,fontWeight:'700'}}>成员名单将在团队数据接入后显示</Text></View></>}
      {tab==='stats' && <><Header title="经营统计" sub="经营数据概览" /><Empty title="统计页面已建立" desc="接入真实订单后，可显示销售额、订单数量与商品表现。金额单位为人民币 CNY。" /></>}
      {!!notice && <Text style={{color:C.green,fontSize:12,marginTop:14}}>{notice}</Text>}
    </ScrollView>
    <View style={{flexDirection:'row',backgroundColor:C.white,borderTopWidth:1,borderTopColor:C.line,paddingTop:8,paddingBottom:8}}>
      {NAV.map(n=><TouchableOpacity key={n.id} onPress={()=>go(n.id)} style={{flex:1,alignItems:'center',paddingVertical:4}}>
        <Text style={{fontSize:20,color:tab===n.id?C.navy:'#9AA6B5'}}>{n.icon}</Text>
        <Text style={{fontSize:10,fontWeight:tab===n.id?'800':'500',color:tab===n.id?C.navy:C.muted,marginTop:3}}>{n.label}</Text>
      </TouchableOpacity>)}
    </View>
  </SafeAreaView>;
}
