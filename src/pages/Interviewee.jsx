import React, { useState, useEffect } from 'react'
import { Upload, Button, Modal, Input, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { extractTextFromPdf, extractTextFromDocx, parseContactInfo } from '../utils/resumeParser'
import { useDispatch, useSelector } from 'react-redux'
import { addCandidate } from '../store/slices/candidatesSlice'
import { startSession } from '../store/slices/sessionSlice'
import Chat from '../components/Chat'
import questionsDB from '../data/questions'

export default function Interviewee(){
  const dispatch = useDispatch()
  const session = useSelector(s=>s.session.current)
  const candidates = useSelector(s=>s.candidates.list)
  const [file, setFile] = useState(null)
  const [profile, setProfile] = useState({name:'', email:'', phone:''})
  const [missingModal, setMissingModal] = useState(false)
  const [welcomeBack, setWelcomeBack] = useState(false)
  const [readyToStart, setReadyToStart] = useState(false)
  const [examStarted, setExamStarted] = useState(false)

  useEffect(()=>{
    if(session && session.paused){
      setWelcomeBack(true)
    }
  },[session])

  async function handleFile(fileObj){
    const f = fileObj
    setFile(f)
    try{
      let text = ''
      if(f.name.toLowerCase().endsWith('.pdf')){
        text = await extractTextFromPdf(f)
      } else if(f.name.toLowerCase().endsWith('.docx')){
        text = await extractTextFromDocx(f)
      } else {
        message.error('Only PDF or DOCX allowed')
        return false
      }
      const parsed = parseContactInfo(text)
      setProfile(parsed)
      if(!parsed.name || !parsed.email || !parsed.phone){
        setMissingModal(true)
      } else {
        const candidate = { name: parsed.name, email: parsed.email, phone: parsed.phone, resumeName: f.name, score: null, summary: '', history: [] }
        dispatch(addCandidate(candidate))
        setReadyToStart(true) // ✅ wait for Start Exam click
        message.success('Profile extracted — click Start Exam when ready')
      }
    }catch(err){
      console.error(err)
      message.error('Failed to parse resume. Try a different file.')
    }
    return false
  }

  function onFillProfile(){
    setMissingModal(false)
    const candidate = { ...profile, resumeName: file ? file.name : 'manual', score: null, summary: '', history: [] }
    dispatch(addCandidate(candidate))
    setReadyToStart(true) // ✅ wait for Start Exam click
  }

  function handleStartExam(){
    dispatch(startSession({ candidateId: candidates[candidates.length-1]?.id || null, questionIndex: 0, answers: [], startedAt: Date.now(), paused: false }))
    setExamStarted(true)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-1 p-4">
        <h2 className="font-medium">Upload Resume</h2>
        <Upload beforeUpload={handleFile} maxCount={1} showUploadList={{showRemoveIcon:false}}>
          <Button icon={<UploadOutlined />}>Upload PDF / DOCX</Button>
        </Upload>
        <div className="mt-4">
          <h3 className="font-semibold">Extracted Profile</h3>
          <p><strong>Name:</strong> {profile.name || '—'}</p>
          <p><strong>Email:</strong> {profile.email || '—'}</p>
          <p><strong>Phone:</strong> {profile.phone || '—'}</p>
        </div>

        {readyToStart && !examStarted && (
          <Button type="primary" className="mt-4" onClick={handleStartExam}>
            Start Exam
          </Button>
        )}
      </div>

      <div className="md:col-span-2 p-4">
        {examStarted ? (
          <Chat questionsDB={questionsDB} />
        ) : (
          <p className="text-gray-500">Upload resume and click "Start Exam" to begin.</p>
        )}
      </div>

      <Modal title="Missing fields" open={missingModal} onOk={onFillProfile} onCancel={()=>setMissingModal(false)}>
        <p>Please complete missing profile fields</p>
        <Input placeholder="Name" value={profile.name} onChange={e=>setProfile(p=>({...p,name:e.target.value}))} className="mb-2"/>
        <Input placeholder="Email" value={profile.email} onChange={e=>setProfile(p=>({...p,email:e.target.value}))} className="mb-2"/>
        <Input placeholder="Phone" value={profile.phone} onChange={e=>setProfile(p=>({...p,phone:e.target.value}))} />
      </Modal>

      <Modal title="Welcome back" open={welcomeBack} onOk={()=>setWelcomeBack(false)} onCancel={()=>setWelcomeBack(false)}>
        <p>You have an unfinished session. Resume or restart from the dashboard.</p>
      </Modal>
    </div>
  )
}
