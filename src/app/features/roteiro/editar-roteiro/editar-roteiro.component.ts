import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoteiroService } from '@core/services/roteiro.service';
import { NotificacaoService } from '@core/services/notificacao.service';
import { Roteiro } from '@core/models/roteiro.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-editar-roteiro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './editar-roteiro.component.html',
  styleUrls: ['./editar-roteiro.component.scss']
})
export class EditarRoteiroComponent implements OnInit {
  roteiroForm!: FormGroup;
  roteiro: Roteiro | null = null;
  loading = true;
  salvando = false;
  imagemPreview: string | null = null;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private roteiroService: RoteiroService,
    private notificacaoService: NotificacaoService
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.carregarRoteiro();
  }

  inicializarFormulario(): void {
    this.roteiroForm = this.fb.group({
      titulo: ['', [Validators.required]],
      descricao: [''],
      destino: ['', [Validators.required]],
      dataInicio: ['', [Validators.required]],
      dataFim: ['', [Validators.required]],
      orcamento_total: [0, [Validators.required, Validators.min(0)]],
      privado: [false],
      imagemCapa: ['']
    }, { validators: this.validarDatas });
  }

  carregarRoteiro(): void {
    const roteiroId = this.route.snapshot.paramMap.get('id');
    if (!roteiroId) {
      this.notificacaoService.exibirErro('ID do roteiro não especificado');
      this.voltar();
      return;
    }

    this.roteiroService.obterRoteiro(roteiroId)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.roteiro = response.data;
            this.preencherFormulario(this.roteiro);
          } else {
            this.notificacaoService.exibirErro(response.message || 'Erro ao carregar roteiro');
            this.voltar();
          }
        },
        error: (error) => {
          this.notificacaoService.exibirErro(
            error?.error?.message || 'Não foi possível carregar o roteiro'
          );
          this.voltar();
        }
      });
  }

  preencherFormulario(roteiro: Roteiro): void {
    this.roteiroForm.patchValue({
      titulo: roteiro.titulo || roteiro.nome,
      descricao: roteiro.descricao,
      destino: roteiro.destino,
      dataInicio: this.formatarData(roteiro.dataInicio),
      dataFim: this.formatarData(roteiro.dataFim),
      orcamento_total: roteiro.orcamento_total || roteiro.orcamento,
      privado: roteiro.privado,
      imagemCapa: roteiro.imagemCapa
    });

    if (roteiro.imagemCapa) {
      this.imagemPreview = roteiro.imagemCapa;
    }
  }

  formatarData(data: Date | string): string {
    if (!data) return '';
    const dataObj = new Date(data);
    return dataObj.toISOString().split('T')[0];
  }

  validarDatas(group: FormGroup) {
    const inicio = group.get('dataInicio')?.value;
    const fim = group.get('dataFim')?.value;
    
    if (inicio && fim) {
      const dataInicio = new Date(inicio);
      const dataFim = new Date(fim);
      
      if (dataFim < dataInicio) {
        return { dataInvalida: true };
      }
    }
    
    return null;
  }

  onImagemSelecionada(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagemPreview = reader.result as string;
        this.roteiroForm.patchValue({
          imagemCapa: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  }

  salvar(): void {
    this.submitted = true;

    if (this.roteiroForm.invalid) {
      return;
    }

    this.salvando = true;
    const dadosRoteiro = {
      ...this.roteiroForm.value,
      id: this.roteiro?.id
    };

    const roteiroId = typeof this.roteiro?.id === 'string' ? parseInt(this.roteiro.id) : this.roteiro?.id;

    if (!roteiroId) {
      this.notificacaoService.exibirErro('ID do roteiro não encontrado');
      return;
    }

    this.roteiroService.atualizarRoteiro(roteiroId, dadosRoteiro)
      .pipe(finalize(() => this.salvando = false))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.notificacaoService.exibirSucesso('Roteiro atualizado com sucesso!');
            this.router.navigate(['/roteiro', this.roteiro?.id]);
          } else {
            this.notificacaoService.exibirErro(response.message || 'Erro ao atualizar roteiro');
          }
        },
        error: (error) => {
          this.notificacaoService.exibirErro(
            error?.error?.message || 'Não foi possível atualizar o roteiro'
          );
        }
      });
  }

  voltar(): void {
    if (this.roteiro?.id) {
      this.router.navigate(['/roteiro', this.roteiro.id]);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  get f() {
    return this.roteiroForm.controls;
  }
} 