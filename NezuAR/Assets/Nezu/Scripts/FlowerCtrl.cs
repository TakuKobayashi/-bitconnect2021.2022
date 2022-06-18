using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.Playables;
using Cinemachine;

namespace NezuHack
{
    public class FlowerCtrl : MonoBehaviour
    {
        [SerializeField] Transform m_targetTr;
        [SerializeField] AnimationCurve m_scaleAC;
        [SerializeField] AudioSource m_audioSource;
        [SerializeField] PlayableDirector m_timeline;
        [SerializeField] ParticleSystem m_ps;
        [SerializeField] ParticleSystem m_gndHitPs;
        [SerializeField] ParticleSystem m_smokePs;
        [SerializeField] ParticleSystem m_flashPs;
        [SerializeField] AudioClip m_explodeClip;
        [SerializeField] AudioClip m_growClip;
        [SerializeField] AudioClip m_finishClip;
        [SerializeField] AudioClip m_jumpClip;
        [SerializeField] AudioClip m_flashClip;
        [SerializeField] GameObject m_modelGo;
        [SerializeField] float m_maxRate;
        [SerializeField] CinemachineImpulseSource m_cinemachineInputSrc;
        [SerializeField]

        // Start is called before the first frame update
        void Start()
        {
            StartCoroutine(growCo());
        }

        // Update is called once per frame
        void Update()
        {
            /*
            if (Keyboard.current.spaceKey.wasPressedThisFrame)
                OnPowerButton(0.1f);
            */
        }
        public void OnFire(InputAction.CallbackContext context)
        {
            if (context.phase == InputActionPhase.Performed)
            {
                OnPowerButton(0.1f);
            }
        }

        IEnumerator growCo()
        {
            m_maxRate = 0f;
            float time = 0f;
            m_targetTr.localScale = Vector3.one*1f;
            m_targetTr.localPosition = Vector3.up*500f;
            m_modelGo.SetActive(true);

            time = 0f;
            while (time < 1f)
            {
                time = Mathf.Min(time + Time.deltaTime * 0.2f, 1f);
                m_targetTr.localPosition = Vector3.up * (1f-time) * 500f;
                yield return null;
            }

            m_gndHitPs.Play();
            m_audioSource.PlayOneShot(m_explodeClip);
            m_cinemachineInputSrc?.GenerateImpulse(6f);
            yield return new WaitForSeconds(5f);
            m_timeline.Play();

            time = 0f;
            while (time < 1f)
            {
                time = Mathf.Min(time + Time.deltaTime * 1f, 1f);
                //m_targetTr.localScale = Vector3.one * (1f-time);
                yield return null;
            }

            yield return new WaitForSeconds(2f);
            m_modelGo.SetActive(true);
            //m_targetTr.localScale = Vector3.zero;

            time = 0f;
            while (time < 1f)
            {
                time = Mathf.Min(time + Time.deltaTime*0.5f, m_maxRate);
                m_targetTr.localScale = Vector3.one * ((m_scaleAC.Evaluate(time) * 1f)+1f);
                yield return null;
            }

            m_audioSource.PlayOneShot(m_finishClip);

            yield return new WaitForSeconds(1f);

            m_audioSource.clip = m_jumpClip;
            m_audioSource.Play();

            m_smokePs.Play();
            time = 0f;
            while (time < 1f)
            {
                time = Mathf.Min(time + Time.deltaTime * 0.2f, 1f);
                m_targetTr.localPosition = Vector3.up * time * 500f;
                yield return null;
            }
            m_flashPs.Play();
            m_audioSource.PlayOneShot(m_flashClip);
            m_modelGo.SetActive(false);

            yield return new WaitForSeconds(4f);
            StartCoroutine(growCo());

        }
        IEnumerator efcCo()
        {
            m_audioSource.clip = m_growClip;
            m_audioSource.Play();
            yield return new WaitForSeconds(0.3f);
            m_ps.Play();
        }

        /// <summary>
        /// 成長させるボタン
        /// </summary>
        /// <param name="_powerRate">0-1の値を入れる.加算した値が1になったら成長完了</param>
        public void OnPowerButton(float _powerRate)
        {
            m_maxRate = Mathf.Min(m_maxRate + _powerRate, 1f);
            StartCoroutine(efcCo());
        }
    }
}
